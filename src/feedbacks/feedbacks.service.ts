import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { paginate } from '../common/dto/pagination.dto';
import { QueryFeedbacksDto } from './dto/query-feedbacks.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbacksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** Tab counts per status + total for the "Góp ý / Phản ánh" tabs. */
  async summary(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const [all, processing, awaiting, completed, rejected] =
      await this.prisma.$transaction([
        this.prisma.feedback.count({ where: { buildingId: bId } }),
        this.prisma.feedback.count({
          where: { buildingId: bId, status: FeedbackStatus.PROCESSING },
        }),
        this.prisma.feedback.count({
          where: { buildingId: bId, status: FeedbackStatus.AWAITING },
        }),
        this.prisma.feedback.count({
          where: { buildingId: bId, status: FeedbackStatus.COMPLETED },
        }),
        this.prisma.feedback.count({
          where: { buildingId: bId, status: FeedbackStatus.REJECTED },
        }),
      ]);
    return {
      tabs: [
        { key: 'all', label: 'Tất cả', count: all },
        { key: 'processing', label: 'Đang xử lý', count: processing },
        { key: 'awaiting', label: 'Chờ phản hồi', count: awaiting },
        { key: 'completed', label: 'Đã hoàn thành', count: completed },
        { key: 'rejected', label: 'Từ chối', count: rejected },
      ],
    };
  }

  async list(accountId: string, query: QueryFeedbacksDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.FeedbackWhereInput = { buildingId };
    if (query.status) where.status = query.status;
    if (query.search)
      where.title = { contains: query.search, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { _count: { select: { images: true } } },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    const items = rows.map((f) => ({
      id: f.id,
      code: f.code,
      category: f.category,
      title: f.title,
      status: f.status.toLowerCase(),
      priority: f.priority.toLowerCase(),
      createdAt: f.createdAt,
      timeLabel: f.createdAt,
      imageCount: f._count.images,
    }));

    return paginate(items, total, query.page, query.limit);
  }

  async detail(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const f = await this.prisma.feedback.findFirst({
      where: { id, buildingId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        history: { orderBy: { createdAt: 'asc' } },
        account: { select: { fullName: true } },
      },
    });
    if (!f) throw new NotFoundException('Không tìm thấy phản ánh');

    return {
      id: f.id,
      code: f.code,
      title: f.title,
      description: f.description,
      status: f.status.toLowerCase(),
      submitter: {
        name: f.account?.fullName ?? 'Cư dân',
      },
      metadata: {
        category: f.category,
        priority: f.priority.toLowerCase(),
        location: f.location,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      },
      images: f.images.map((img) => ({
        id: img.id,
        url: img.url,
        sortOrder: img.sortOrder,
      })),
      history: f.history.map((h) => ({
        id: h.id,
        label: h.label,
        description: h.description,
        status: h.status ? h.status.toLowerCase() : null,
        actorName: h.actorName,
        completed: h.completed,
        time: h.createdAt,
      })),
    };
  }

  async create(accountId: string, dto: CreateFeedbackDto) {
    const buildingId = await this.ctx.resolve(accountId, dto.buildingId);
    const code = this.generateCode();

    const created = await this.prisma.feedback.create({
      data: {
        code,
        buildingId,
        accountId,
        category: dto.category,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        location: dto.location,
        status: FeedbackStatus.PROCESSING,
        images: dto.imageUrls?.length
          ? {
              create: dto.imageUrls.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
        history: {
          create: {
            label: 'Ban quản lý đã tiếp nhận phản ánh',
            status: FeedbackStatus.PROCESSING,
            completed: true,
          },
        },
      },
    });

    return this.detail(accountId, created.id);
  }

  // ── helpers ─────────────────────────────────────────────────

  /** #PA-<yyMMdd>-<4 digit random> e.g. #PA-240525-0012 */
  private generateCode(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `#PA-${yy}${mm}${dd}-${rand}`;
  }
}
