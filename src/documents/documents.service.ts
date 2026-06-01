import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { paginate } from '../common/dto/pagination.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** Danh mục tài liệu của tòa nhà + số lượng tài liệu mỗi danh mục. */
  async categories(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const rows = await this.prisma.documentCategory.findMany({
      where: { buildingId: bId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { documents: true } } },
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      iconUrl: c.iconUrl,
      documentCount: c._count.documents,
    }));
  }

  async list(accountId: string, query: QueryDocumentsDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.DocumentWhereInput = { buildingId };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.fileType) where.fileType = query.fileType;
    if (query.search)
      where.name = { contains: query.search, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { category: { select: { name: true } } },
      }),
      this.prisma.document.count({ where }),
    ]);

    const items = rows.map((d) => this.toListItem(d));
    return paginate(items, total, query.page, query.limit);
  }

  async detail(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const d = await this.prisma.document.findFirst({
      where: { id, buildingId },
      include: { category: { select: { name: true } } },
    });
    if (!d) throw new NotFoundException('Không tìm thấy tài liệu');

    await this.prisma.document.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: d.id,
      name: d.name,
      fileType: d.fileType.toLowerCase(),
      category: d.category?.name ?? null,
      categoryId: d.categoryId,
      sizeLabel: this.formatSize(d.sizeBytes),
      viewCount: d.viewCount + 1,
      updatedDate: d.updatedAt,
      url: d.url,
    };
  }

  async incrementView(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const d = await this.prisma.document.findFirst({
      where: { id, buildingId },
      select: { id: true },
    });
    if (!d) throw new NotFoundException('Không tìm thấy tài liệu');

    await this.prisma.document.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    return { success: true };
  }

  // ── mappers ─────────────────────────────────────────────────

  private toListItem(d: any) {
    return {
      id: d.id,
      name: d.name,
      fileType: d.fileType.toLowerCase(),
      category: d.category?.name ?? null,
      categoryId: d.categoryId,
      sizeLabel: this.formatSize(d.sizeBytes),
      viewCount: d.viewCount,
      updatedDate: d.updatedAt,
      url: d.url,
    };
  }

  private formatSize(bytes?: number | null): string {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  }
}
