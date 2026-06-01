import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { QueryArchiveDto } from './dto/query-archive.dto';

@Injectable()
export class ArchiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  async stats(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const [agg, docs] = await this.prisma.$transaction([
      this.prisma.document.aggregate({
        where: { buildingId: bId },
        _count: true,
        _sum: { sizeBytes: true, downloadCount: true },
      }),
      this.prisma.document.findMany({
        where: { buildingId: bId },
        select: { createdAt: true },
      }),
    ]);

    const totalStorageBytes = Number(agg._sum.sizeBytes ?? 0);
    const years = docs.map((d) => d.createdAt.getFullYear());
    const distinctYears = [...new Set(years)];

    return {
      totalDocuments: agg._count,
      totalStorageBytes,
      storageLabel: this.formatStorage(totalStorageBytes),
      yearsArchived: distinctYears.length,
      range: distinctYears.length
        ? { from: Math.min(...distinctYears), to: Math.max(...distinctYears) }
        : { from: null, to: null },
      totalDownloads: agg._sum.downloadCount ?? 0,
    };
  }

  async list(accountId: string, query: QueryArchiveDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.DocumentWhereInput = { buildingId };
    if (query.search)
      where.name = { contains: query.search, mode: 'insensitive' };
    if (query.category) where.archiveCategory = query.category;
    if (query.fileType) where.fileType = query.fileType;
    if (query.year) {
      const from = new Date(query.year, 0, 1);
      const to = new Date(query.year + 1, 0, 1);
      where.createdAt = { gte: from, lt: to };
    }

    const docs = await this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Group by year -> month in plain JS (already ordered createdAt desc).
    const yearMap = new Map<
      number,
      { year: number; count: number; months: Map<string, any> }
    >();

    for (const d of docs) {
      const dt = d.createdAt;
      const year = dt.getFullYear();
      const month = dt.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;

      let yearEntry = yearMap.get(year);
      if (!yearEntry) {
        yearEntry = { year, count: 0, months: new Map() };
        yearMap.set(year, yearEntry);
      }
      yearEntry.count += 1;

      let monthEntry = yearEntry.months.get(key);
      if (!monthEntry) {
        monthEntry = {
          key,
          label: `Tháng ${month} / ${year}`,
          count: 0,
          documents: [],
        };
        yearEntry.months.set(key, monthEntry);
      }
      monthEntry.count += 1;
      monthEntry.documents.push({
        id: d.id,
        name: d.name,
        fileType: d.fileType.toLowerCase(),
        archiveCategory: d.archiveCategory
          ? d.archiveCategory.toLowerCase()
          : null,
        uploadDate: d.createdAt,
        sizeBytes: d.sizeBytes,
        sizeLabel: this.formatSize(d.sizeBytes),
        downloadCount: d.downloadCount,
      });
    }

    const years = [...yearMap.values()]
      .sort((a, b) => b.year - a.year)
      .map((y) => {
        const months = [...y.months.values()].sort((a, b) =>
          a.key < b.key ? 1 : a.key > b.key ? -1 : 0,
        );
        return {
          year: y.year,
          count: y.count,
          monthCount: months.length,
          months,
        };
      });

    return { years };
  }

  async byCategory(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const grouped = await this.prisma.document.groupBy({
      by: ['archiveCategory'],
      where: { buildingId: bId },
      _count: true,
    });
    return grouped
      .map((g) => ({
        category: g.archiveCategory ? g.archiveCategory.toLowerCase() : 'other',
        count: g._count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async topDownloads(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const docs = await this.prisma.document.findMany({
      where: { buildingId: bId },
      orderBy: { downloadCount: 'desc' },
      take: 5,
      select: { id: true, name: true, downloadCount: true },
    });
    return docs.map((d) => ({
      id: d.id,
      name: d.name,
      downloadCount: d.downloadCount,
    }));
  }

  async fileTypes(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const grouped = await this.prisma.document.groupBy({
      by: ['fileType'],
      where: { buildingId: bId },
      _count: true,
    });
    const total = grouped.reduce((sum, g) => sum + g._count, 0);
    return grouped
      .map((g) => ({
        fileType: g.fileType.toLowerCase(),
        count: g._count,
        pct: total ? Number(((g._count / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  async download(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const doc = await this.prisma.document.findFirst({
      where: { id, buildingId },
    });
    if (!doc) throw new NotFoundException('Không tìm thấy tài liệu');

    const updated = await this.prisma.document.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
      select: { url: true },
    });
    return { url: updated.url };
  }

  // ── helpers ───────────────────────────────────────────────────

  private formatSize(bytes?: number | null): string {
    const b = Number(bytes ?? 0);
    if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(b / 1024)} KB`;
  }

  private formatStorage(bytes: number): string {
    if (bytes >= 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
