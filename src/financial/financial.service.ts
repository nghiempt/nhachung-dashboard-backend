import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { paginate } from '../common/dto/pagination.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class FinancialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** Tổng quan tài chính: FinancialPeriod + line items + quỹ bảo trì + báo cáo mới nhất. */
  async overview(accountId: string, period?: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const fp = await this.prisma.financialPeriod.findFirst({
      where: { buildingId: bId, ...(period ? { period } : {}) },
      orderBy: { period: 'desc' },
      include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!fp) throw new NotFoundException('Không tìm thấy kỳ tài chính');

    const [fund, latestReport] = await this.prisma.$transaction([
      this.prisma.maintenanceFund.findUnique({ where: { buildingId: bId } }),
      this.prisma.report.findFirst({
        where: { buildingId: bId, status: ReportStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    const income = fp.lineItems
      .filter((li) => li.kind === 'INCOME')
      .map((li) => this.toLineItem(li));
    const expense = fp.lineItems
      .filter((li) => li.kind === 'EXPENSE')
      .map((li) => this.toLineItem(li));

    return {
      period: fp.period,
      totalIncome: fp.totalIncome,
      totalExpense: fp.totalExpense,
      surplus: fp.surplus,
      incomeChangePct: fp.incomeChangePct,
      expenseChangePct: fp.expenseChangePct,
      surplusChangePct: fp.surplusChangePct,
      ratios: {
        collectionRate: fp.collectionRate,
        expenseRatio: fp.expenseRatio,
        fundUsageRate: fp.fundUsageRate,
        collectionRateChangePct: fp.collectionRateChangePct,
        expenseRatioChangePct: fp.expenseRatioChangePct,
      },
      unitsPaid: fp.unitsPaid,
      unitsTotal: fp.unitsTotal,
      lineItems: { income, expense },
      maintenanceFund: fund
        ? {
            balance: fund.balance,
            balanceChangePct: fund.balanceChangePct,
          }
        : null,
      latestReport: latestReport
        ? {
            title: latestReport.title,
            fileType: latestReport.fileType
              ? latestReport.fileType.toLowerCase()
              : null,
            sizeBytes: latestReport.sizeBytes,
            sizeLabel: this.formatSize(latestReport.sizeBytes),
            publishedAt: latestReport.publishedAt,
            viewCount: latestReport.viewCount,
            responsibleName: latestReport.responsibleName,
          }
        : null,
    };
  }

  /** N kỳ gần nhất cho biểu đồ 6 tháng. */
  async periods(accountId: string, months = 6, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const rows = await this.prisma.financialPeriod.findMany({
      where: { buildingId: bId },
      orderBy: { period: 'desc' },
      take: months,
      select: {
        period: true,
        totalIncome: true,
        totalExpense: true,
        surplus: true,
      },
    });

    return rows
      .slice()
      .reverse()
      .map((r) => ({
        period: r.period,
        totalIncome: r.totalIncome,
        totalExpense: r.totalExpense,
        surplus: r.surplus,
      }));
  }

  /** Sổ giao dịch (thu-chi) phân trang. */
  async transactions(accountId: string, query: QueryTransactionsDto) {
    const bId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.TransactionWhereInput = { buildingId: bId };

    if (query.type) {
      where.type = query.type.toUpperCase() as TransactionType;
    }

    if (query.period) {
      const [y, m] = query.period.split('-').map((v) => parseInt(v, 10));
      if (y && m) {
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end = new Date(Date.UTC(y, m, 1));
        where.occurredAt = { gte: start, lt: end };
      }
    }

    if (query.search) {
      where.description = { contains: query.search, mode: 'insensitive' };
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const items = rows.map((t) => ({
      id: t.id,
      code: t.code,
      type: t.type.toLowerCase(),
      category: t.category,
      description: t.description,
      subInfo: t.subInfo,
      vendorName: t.vendorName,
      contractRef: t.contractRef,
      paymentMethod: t.paymentMethod,
      amount: t.amount,
      occurredAt: t.occurredAt,
    }));

    return paginate(items, total, query.page, query.limit);
  }

  // ── mappers ─────────────────────────────────────────────────

  private toLineItem(li: any) {
    return {
      id: li.id,
      name: li.name,
      category: li.category,
      amount: li.amount,
      pctOfTotal: li.pctOfTotal,
      comparisonPct: li.comparisonPct,
      comparisonDirection: li.comparisonDirection
        ? li.comparisonDirection.toLowerCase()
        : null,
      subInfo: li.subInfo,
      color: li.color,
      sortOrder: li.sortOrder,
    };
  }

  private formatSize(bytes?: number | null): string {
    if (!bytes) return '';
    const n = Number(bytes);
    if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(n / 1024)} KB`;
  }
}
