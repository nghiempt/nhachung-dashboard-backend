import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  CreateNotificationDto,
  QueryNotificationsDto,
  UpdateNotificationDto,
} from './dto/notifications.dto';

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(buildingId: string, query: QueryNotificationsDto) {
    const where: Prisma.NotificationWhereInput = { buildingId };
    if (query.category) where.category = query.category;
    if (query.urgent !== undefined) where.isUrgent = query.urgent;
    if (query.search)
      where.title = { contains: query.search, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { _count: { select: { reads: true, attachments: true } } },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const items = rows.map((n) => ({
      id: n.id,
      eyebrow: n.eyebrow,
      title: n.title,
      category: n.category.toLowerCase(),
      iconType: n.iconType.toLowerCase(),
      isUrgent: n.isUrgent,
      authorName: n.authorName,
      authorRole: n.authorRole,
      viewCount: n.viewCount,
      readCount: n._count.reads,
      attachmentCount: n._count.attachments,
      publishedAt: n.publishedAt,
    }));

    return paginate(items, total, query.page, query.limit);
  }

  async stats(buildingId: string) {
    const [total, urgent] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { buildingId } }),
      this.prisma.notification.count({ where: { buildingId, isUrgent: true } }),
    ]);
    return { total, urgent };
  }

  async detail(buildingId: string, id: string) {
    const n = await this.prisma.notification.findFirst({
      where: { id, buildingId },
      include: { attachments: true },
    });
    if (!n) throw new NotFoundException('Không tìm thấy thông báo');
    return {
      ...n,
      category: n.category.toLowerCase(),
      iconType: n.iconType.toLowerCase(),
    };
  }

  async create(
    buildingId: string,
    accountId: string,
    dto: CreateNotificationDto,
  ) {
    const n = await this.prisma.notification.create({
      data: {
        buildingId,
        title: dto.title,
        body: dto.body ?? undefined,
        category: dto.category ?? 'ANNOUNCEMENT',
        iconType: dto.iconType ?? 'BELL',
        isUrgent: dto.isUrgent ?? false,
        eyebrow: dto.eyebrow,
        authorId: accountId,
        authorName: dto.authorName,
        authorRole: dto.authorRole,
      },
    });
    return this.detail(buildingId, n.id);
  }

  private async ensure(buildingId: string, id: string) {
    const n = await this.prisma.notification.findFirst({
      where: { id, buildingId },
    });
    if (!n) throw new NotFoundException('Không tìm thấy thông báo');
    return n;
  }

  async update(buildingId: string, id: string, dto: UpdateNotificationDto) {
    await this.ensure(buildingId, id);
    await this.prisma.notification.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.iconType !== undefined ? { iconType: dto.iconType } : {}),
        ...(dto.isUrgent !== undefined ? { isUrgent: dto.isUrgent } : {}),
        ...(dto.eyebrow !== undefined ? { eyebrow: dto.eyebrow } : {}),
      },
    });
    return this.detail(buildingId, id);
  }

  async remove(buildingId: string, id: string) {
    await this.ensure(buildingId, id);
    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }
}
