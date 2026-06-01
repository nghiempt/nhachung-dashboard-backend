import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportPeriodType, ReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { QueryReportsDto } from './dto/query-reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** Summary cards for a given year (defaults to current year). */
  async summary(accountId: string, year?: number, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const targetYear = year ?? new Date().getFullYear();

    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [total, published, pending, dueSoon] = await this.prisma.$transaction(
      [
        this.prisma.report.count({
          where: { buildingId: bId, ...this.yearFilter(targetYear) },
        }),
        this.prisma.report.count({
          where: { buildingId: bId, status: ReportStatus.PUBLISHED },
        }),
        this.prisma.report.count({
          where: { buildingId: bId, status: ReportStatus.PENDING },
        }),
        this.prisma.report.count({
          where: {
            buildingId: bId,
            status: { not: ReportStatus.PUBLISHED },
            dueDate: { gte: now, lte: soon },
          },
        }),
      ],
    );

    return { total, published, pending, dueSoon };
  }

  /** Tabbed report list. */
  async list(accountId: string, query: QueryReportsDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const baseWhere: Prisma.ReportWhereInput = { buildingId };
    if (query.year) Object.assign(baseWhere, this.yearFilter(query.year));

    const where: Prisma.ReportWhereInput = { ...baseWhere };
    if (query.periodType) where.periodType = query.periodType;

    const [rows, allCount, monthCount, quarterCount, yearCount] =
      await this.prisma.$transaction([
        this.prisma.report.findMany({
          where,
          orderBy: [
            { publishedAt: { sort: 'desc', nulls: 'last' } },
            { dueDate: 'asc' },
          ],
        }),
        this.prisma.report.count({ where: baseWhere }),
        this.prisma.report.count({
          where: { ...baseWhere, periodType: ReportPeriodType.MONTH },
        }),
        this.prisma.report.count({
          where: { ...baseWhere, periodType: ReportPeriodType.QUARTER },
        }),
        this.prisma.report.count({
          where: { ...baseWhere, periodType: ReportPeriodType.YEAR },
        }),
      ]);

    return {
      tabs: [
        { key: 'all', label: 'Tất cả', count: allCount },
        { key: 'month', label: 'Tháng', count: monthCount },
        { key: 'quarter', label: 'Quý', count: quarterCount },
        { key: 'year', label: 'Năm', count: yearCount },
      ],
      items: rows.map((r) => this.toItem(r)),
    };
  }

  /** Upcoming reports (DRAFT/PENDING with a due date), soonest first. */
  async upcoming(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const rows = await this.prisma.report.findMany({
      where: {
        buildingId: bId,
        status: { in: [ReportStatus.DRAFT, ReportStatus.PENDING] },
        dueDate: { not: null },
      },
      orderBy: { dueDate: 'asc' },
    });

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      periodLabel: r.periodLabel,
      status: r.status.toLowerCase(),
      responsibleName: r.responsibleName,
      dueDate: r.dueDate,
    }));
  }

  /** Increment the view counter. */
  async incrementView(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const report = await this.prisma.report.findFirst({
      where: { id, buildingId },
      select: { id: true },
    });
    if (!report) throw new NotFoundException('Không tìm thấy báo cáo');

    await this.prisma.report.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return { success: true };
  }

  // ── helpers ────────────────────────────────────────────────

  /** Match a year against publishedAt OR dueDate. */
  private yearFilter(year: number): Prisma.ReportWhereInput {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const range = { gte: start, lt: end };
    return {
      OR: [{ publishedAt: range }, { dueDate: range }],
    };
  }

  private toItem(r: {
    id: string;
    title: string;
    periodType: ReportPeriodType;
    periodLabel: string;
    status: ReportStatus;
    category: string | null;
    fileType: string | null;
    sizeBytes: number | null;
    url: string | null;
    responsibleName: string | null;
    dueDate: Date | null;
    publishedAt: Date | null;
    viewCount: number;
    downloadCount: number;
  }) {
    return {
      id: r.id,
      title: r.title,
      periodType: r.periodType.toLowerCase(),
      periodLabel: r.periodLabel,
      status: r.status.toLowerCase(),
      category: r.category ? r.category.toLowerCase() : null,
      fileType: r.fileType ? r.fileType.toLowerCase() : null,
      sizeBytes: r.sizeBytes,
      sizeLabel: this.formatSize(r.sizeBytes),
      url: r.url,
      responsibleName: r.responsibleName,
      dueDate: r.dueDate,
      publishedAt: r.publishedAt,
      viewCount: r.viewCount,
      downloadCount: r.downloadCount,
    };
  }

  private formatSize(bytes?: number | null): string {
    if (!bytes) return '';
    const n = Number(bytes);
    if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(n / 1024)} KB`;
  }
}
