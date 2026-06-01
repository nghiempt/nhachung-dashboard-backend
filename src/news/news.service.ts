import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { paginate } from '../common/dto/pagination.dto';
import { QueryNewsDto } from './dto/query-news.dto';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  async list(accountId: string, query: QueryNewsDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.NewsWhereInput = { buildingId };
    if (query.category) where.category = query.category;
    if (query.pinned !== undefined) where.isPinned = query.pinned;
    if (query.search)
      where.title = { contains: query.search, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.news.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.news.count({ where }),
    ]);

    const items = rows.map((n) => this.toListItem(n));
    return paginate(items, total, query.page, query.limit);
  }

  /** The most recent pinned article (or most recent overall) — full object. */
  async featured(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const article = await this.prisma.news.findFirst({
      where: { buildingId: bId },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });
    if (!article) throw new NotFoundException('Chưa có tin tức nào');
    return this.toFull(article);
  }

  /** Top 5 articles by view count. */
  async trending(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const rows = await this.prisma.news.findMany({
      where: { buildingId: bId },
      orderBy: { viewCount: 'desc' },
      take: 5,
    });
    return rows.map((n, i) => ({
      rank: i + 1,
      id: n.id,
      title: n.title,
      viewCount: n.viewCount,
    }));
  }

  async detail(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const article = await this.prisma.news.findFirst({
      where: { id, buildingId },
    });
    if (!article) throw new NotFoundException('Không tìm thấy tin tức');

    await this.prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return this.toFull({ ...article, viewCount: article.viewCount + 1 });
  }

  // ── mappers ─────────────────────────────────────────────────

  private toListItem(n: any) {
    return {
      id: n.id,
      title: n.title,
      excerpt: n.excerpt,
      thumbnailUrl: n.thumbnailUrl,
      category: n.category.toLowerCase(),
      tags: n.tags ?? [],
      isPinned: n.isPinned,
      readMinutes: n.readMinutes,
      viewCount: n.viewCount,
      authorName: n.authorName,
      authorLabel: n.authorLabel,
      publishedAt: n.publishedAt,
    };
  }

  private toFull(n: any) {
    return {
      id: n.id,
      title: n.title,
      excerpt: n.excerpt,
      content: n.content,
      thumbnailUrl: n.thumbnailUrl,
      category: n.category.toLowerCase(),
      tags: n.tags ?? [],
      isPinned: n.isPinned,
      readMinutes: n.readMinutes,
      viewCount: n.viewCount,
      authorName: n.authorName,
      authorLabel: n.authorLabel,
      publishedAt: n.publishedAt,
    };
  }
}
