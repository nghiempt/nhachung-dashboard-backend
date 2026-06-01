import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';

@Injectable()
export class KpiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** The KPI period (explicit `period` or latest by period desc) with nested categories + metrics. */
  async overview(accountId: string, period?: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const kpiPeriod = await this.prisma.kpiPeriod.findFirst({
      where: { buildingId: bId, ...(period ? { period } : {}) },
      orderBy: { period: 'desc' },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            metrics: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (!kpiPeriod) throw new NotFoundException('Không tìm thấy dữ liệu KPI');

    return {
      period: kpiPeriod.period,
      periodLabel: kpiPeriod.periodLabel,
      totalScore: kpiPeriod.totalScore,
      maxScore: kpiPeriod.maxScore,
      grade: kpiPeriod.grade.toLowerCase(),
      targetScore: kpiPeriod.targetScore,
      scoreChange: kpiPeriod.scoreChange,
      comparisonPeriod: kpiPeriod.comparisonPeriod,
      counts: {
        achieved: kpiPeriod.achievedCount,
        needsImprovement: kpiPeriod.needsImprovementCount,
        notAchieved: kpiPeriod.notAchievedCount,
        total: kpiPeriod.totalMetrics,
      },
      categories: kpiPeriod.categories.map((c) => ({
        name: c.name,
        color: c.color,
        score: c.score,
        maxScore: c.maxScore,
        metricsPassed: c.metricsPassed,
        metricsTotal: c.metricsTotal,
        grade: c.grade.toLowerCase(),
        metrics: c.metrics.map((m) => ({
          name: m.name,
          unit: m.unit,
          targetValue: m.targetValue,
          actualValue: m.actualValue,
          statusColor: m.statusColor,
          achievementPct: m.achievementPct,
          pointsEarned: m.pointsEarned,
          pointsMax: m.pointsMax,
          resultBadge: m.resultBadge ? m.resultBadge.toLowerCase() : null,
        })),
      })),
    };
  }

  /** 6-quarter trend chart: periods ordered period asc. */
  async trend(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const periods = await this.prisma.kpiPeriod.findMany({
      where: { buildingId: bId },
      orderBy: { period: 'asc' },
    });
    return periods.map((p) => ({
      period: p.period,
      periodLabel: p.periodLabel,
      totalScore: p.totalScore,
      targetScore: p.targetScore,
    }));
  }

  /** Board members ordered by sortOrder. */
  async members(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const members = await this.prisma.boardMember.findMany({
      where: { buildingId: bId },
      orderBy: { sortOrder: 'asc' },
    });
    return members.map((m) => ({
      id: m.id,
      name: m.name,
      initials: m.initials,
      role: m.role,
      score: m.score,
      grade: m.grade ? m.grade.toLowerCase() : null,
      termStart: m.termStart,
      termEnd: m.termEnd,
      avatarColor: m.avatarColor,
    }));
  }
}
