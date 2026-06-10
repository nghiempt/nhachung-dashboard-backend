import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  QueryAdminFeedbacksDto,
  ReplyFeedbackDto,
  UpdateFeedbackDto,
} from './dto/feedbacks.dto';

@Injectable()
export class AdminFeedbacksService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(buildingId: string) {
    const [all, processing, awaiting, completed, rejected] =
      await this.prisma.$transaction([
        this.prisma.feedback.count({ where: { buildingId } }),
        this.prisma.feedback.count({
          where: { buildingId, status: FeedbackStatus.PROCESSING },
        }),
        this.prisma.feedback.count({
          where: { buildingId, status: FeedbackStatus.AWAITING },
        }),
        this.prisma.feedback.count({
          where: { buildingId, status: FeedbackStatus.COMPLETED },
        }),
        this.prisma.feedback.count({
          where: { buildingId, status: FeedbackStatus.REJECTED },
        }),
      ]);
    return { all, processing, awaiting, completed, rejected };
  }

  async list(buildingId: string, query: QueryAdminFeedbacksDto) {
    const where: Prisma.FeedbackWhereInput = { buildingId };
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          _count: { select: { images: true } },
          account: { select: { fullName: true } },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    const items = rows.map((f) => ({
      id: f.id,
      code: f.code,
      category: f.category,
      title: f.title,
      reporterName: f.account?.fullName ?? null,
      location: f.location,
      status: f.status.toLowerCase(),
      priority: f.priority.toLowerCase(),
      imageCount: f._count.images,
      createdAt: f.createdAt,
    }));

    return paginate(items, total, query.page, query.limit);
  }

  async detail(buildingId: string, id: string) {
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
      category: f.category,
      title: f.title,
      description: f.description,
      location: f.location,
      reporterName: f.account?.fullName ?? null,
      status: f.status.toLowerCase(),
      priority: f.priority.toLowerCase(),
      images: f.images.map((i) => i.url),
      history: f.history,
      createdAt: f.createdAt,
    };
  }

  private async ensure(buildingId: string, id: string) {
    const f = await this.prisma.feedback.findFirst({
      where: { id, buildingId },
    });
    if (!f) throw new NotFoundException('Không tìm thấy phản ánh');
    return f;
  }

  async update(buildingId: string, id: string, dto: UpdateFeedbackDto) {
    await this.ensure(buildingId, id);
    await this.prisma.feedback.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      },
    });
    return this.detail(buildingId, id);
  }

  async reply(
    buildingId: string,
    id: string,
    accountId: string,
    dto: ReplyFeedbackDto,
  ) {
    await this.ensure(buildingId, id);
    const actor = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { fullName: true },
    });
    const actorName = actor?.fullName ?? 'Ban quản trị';
    await this.prisma.feedbackHistory.create({
      data: {
        feedbackId: id,
        label: dto.label,
        description: dto.description,
        status: dto.status,
        actorName,
        completed: true,
      },
    });
    if (dto.status) {
      await this.prisma.feedback.update({
        where: { id },
        data: { status: dto.status },
      });
    }
    return this.detail(buildingId, id);
  }
}
