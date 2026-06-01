import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { paginate } from '../common/dto/pagination.dto';
import { NotificationTab, QueryNotificationsDto } from './dto/query-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  async list(accountId: string, query: QueryNotificationsDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.NotificationWhereInput = { buildingId };
    if (query.category) where.category = query.category;
    if (query.search)
      where.title = { contains: query.search, mode: 'insensitive' };

    if (query.tab === NotificationTab.URGENT) where.isUrgent = true;
    if (query.tab === NotificationTab.UNREAD)
      where.reads = { none: { accountId } };
    if (query.tab === NotificationTab.READ)
      where.reads = { some: { accountId } };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ isUrgent: 'desc' }, { publishedAt: 'desc' }],
        skip: query.skip,
        take: query.limit,
        include: { reads: { where: { accountId }, select: { id: true } } },
      }),
      this.prisma.notification.count({ where }),
    ]);

    const items = rows.map((n) => this.toListItem(n, n.reads.length > 0));
    return paginate(items, total, query.page, query.limit);
  }

  /** Tab counts + category breakdown for the right rail. */
  async summary(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const [all, urgent, unread, categories] = await this.prisma.$transaction([
      this.prisma.notification.count({ where: { buildingId: bId } }),
      this.prisma.notification.count({ where: { buildingId: bId, isUrgent: true } }),
      this.prisma.notification.count({
        where: { buildingId: bId, reads: { none: { accountId } } },
      }),
      this.prisma.notification.groupBy({
        by: ['category'],
        where: { buildingId: bId },
        _count: true,
        orderBy: { category: 'asc' },
      }),
    ]);
    return {
      tabs: [
        { key: 'all', label: 'Tất cả', count: all },
        { key: 'urgent', label: 'Thông báo khẩn', count: urgent },
        { key: 'unread', label: 'Chưa đọc', count: unread },
        { key: 'read', label: 'Đã đọc', count: all - unread },
      ],
      categories: categories.map((c) => ({
        category: c.category.toLowerCase(),
        count: c._count,
      })),
    };
  }

  async detail(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const n = await this.prisma.notification.findFirst({
      where: { id, buildingId },
      include: {
        attachments: true,
        reads: { where: { accountId }, select: { id: true } },
        author: { select: { fullName: true } },
      },
    });
    if (!n) throw new NotFoundException('Không tìm thấy thông báo');

    // mark read + bump views (idempotent read via upsert)
    await this.markRead(accountId, id);
    await this.prisma.notification.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: n.id,
      category: n.category.toLowerCase(),
      eyebrow: n.eyebrow,
      title: n.title,
      iconType: n.iconType.toLowerCase(),
      isUrgent: n.isUrgent,
      status: 'read',
      author: {
        name: n.authorName ?? n.author?.fullName ?? 'Ban quản trị',
        role: n.authorRole ?? 'Quản trị tòa nhà',
        verified: n.authorVerified,
        time: n.publishedAt,
        viewCount: n.viewCount + 1,
      },
      body: n.body ?? [],
      timeCard: n.timeCard ?? null,
      checklist: n.checklist ?? null,
      alertText: n.alertText,
      signoff: n.signoff ?? null,
      attachments: n.attachments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type.toLowerCase(),
        sizeLabel: this.formatSize(a.sizeBytes),
        url: a.url,
      })),
    };
  }

  async markRead(accountId: string, id: string) {
    await this.prisma.notificationRead.upsert({
      where: { notificationId_accountId: { notificationId: id, accountId } },
      create: { notificationId: id, accountId },
      update: {},
    });
    return { success: true };
  }

  async markAllRead(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const unread = await this.prisma.notification.findMany({
      where: { buildingId: bId, reads: { none: { accountId } } },
      select: { id: true },
    });
    if (unread.length) {
      await this.prisma.notificationRead.createMany({
        data: unread.map((n) => ({ notificationId: n.id, accountId })),
        skipDuplicates: true,
      });
    }
    return { success: true, marked: unread.length };
  }

  // ── mappers ─────────────────────────────────────────────────

  private toListItem(n: any, isRead: boolean) {
    return {
      id: n.id,
      category: n.category.toLowerCase(),
      status: isRead ? 'read' : 'unread',
      eyebrow: n.eyebrow,
      title: n.title,
      time: n.publishedAt,
      iconType: n.iconType.toLowerCase(),
      isUrgent: n.isUrgent,
      viewCount: n.viewCount,
    };
  }

  private formatSize(bytes?: number | null): string {
    if (!bytes) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  }
}
