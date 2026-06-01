import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { QueryJobsDto } from './dto/query-jobs.dto';

@Injectable()
export class FundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** The MaintenanceFund row for a building + computed unitsUnpaid. */
  async overview(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const fund = await this.prisma.maintenanceFund.findUnique({
      where: { buildingId: bId },
    });
    if (!fund) throw new NotFoundException('Chưa có quỹ bảo trì cho tòa nhà này');

    return {
      id: fund.id,
      buildingId: fund.buildingId,
      balance: fund.balance,
      totalCollected: fund.totalCollected,
      totalSpent: fund.totalSpent,
      interestIncome: fund.interestIncome,
      balanceChangePct: fund.balanceChangePct,
      collectedChangePct: fund.collectedChangePct,
      spentChangePct: fund.spentChangePct,
      bankName: fund.bankName,
      accountNoMasked: fund.accountNoMasked,
      interestRate: fund.interestRate,
      contributionRate: fund.contributionRate,
      collectionRate: fund.collectionRate,
      unitsPaid: fund.unitsPaid,
      unitsTotal: fund.unitsTotal,
      unitsUnpaid: (fund.unitsTotal ?? 0) - (fund.unitsPaid ?? 0),
      updatedAt: fund.updatedAt,
    };
  }

  /** Fund balance movement chart, ordered by sortOrder then period. */
  async movements(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const periods = await this.prisma.fundPeriod.findMany({
      where: { buildingId: bId },
      orderBy: [{ sortOrder: 'asc' }, { period: 'asc' }],
    });
    return periods.map((p) => ({
      period: p.period,
      cumulativeBalance: p.cumulativeBalance,
      maintenanceCost: p.maintenanceCost,
    }));
  }

  /** Fund collection by block for a given period (or the latest present). */
  async blocks(accountId: string, period?: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    let targetPeriod = period;
    if (!targetPeriod) {
      const latest = await this.prisma.blockCollection.findFirst({
        where: { buildingId: bId },
        orderBy: { period: 'desc' },
        select: { period: true },
      });
      targetPeriod = latest?.period;
    }
    if (!targetPeriod) return [];

    const rows = await this.prisma.blockCollection.findMany({
      where: { buildingId: bId, period: targetPeriod },
      orderBy: { block: 'asc' },
    });

    return rows.map((b) => ({
      block: b.block,
      unitsPaid: b.unitsPaid,
      unitsTotal: b.unitsTotal,
      rate:
        b.unitsTotal > 0
          ? Math.round((b.unitsPaid / b.unitsTotal) * 1000) / 10
          : 0,
      unitsUnpaid: b.unitsTotal - b.unitsPaid,
    }));
  }

  /** Maintenance jobs, optionally filtered by status. */
  async jobs(accountId: string, query: QueryJobsDto) {
    const bId = await this.ctx.resolve(accountId, query.buildingId);

    // Only fund-financed maintenance belongs to the Quỹ bảo trì page;
    // the weekly operations schedule (fundFinanced=false) is excluded.
    const where: Prisma.MaintenanceJobWhereInput = { buildingId: bId, fundFinanced: true };
    if (query.status) where.status = query.status;

    const jobs = await this.prisma.maintenanceJob.findMany({ where });

    // completed: by actualDate desc; others: by scheduledAt asc then createdAt asc.
    const time = (d: Date | null) => (d ? d.getTime() : 0);
    jobs.sort((a, b) => {
      const aDone = a.status === 'COMPLETED';
      const bDone = b.status === 'COMPLETED';
      if (aDone !== bDone) return aDone ? -1 : 1;
      if (aDone) return time(b.actualDate) - time(a.actualDate);
      const sched = time(a.scheduledAt) - time(b.scheduledAt);
      if (sched !== 0) return sched;
      return time(a.createdAt) - time(b.createdAt);
    });

    return jobs.map((j) => ({
      id: j.id,
      name: j.name,
      category: j.category,
      contractor: j.contractor,
      status: j.status.toLowerCase(),
      amount: j.amount,
      estimatedCost: j.estimatedCost,
      scheduledPeriod: j.scheduledPeriod,
      actualDate: j.actualDate,
      fundFinanced: j.fundFinanced,
    }));
  }
}
