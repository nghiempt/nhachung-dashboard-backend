import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  async overview(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const [account, building, residents, unread, feedbackProcessing, feedbackTotal, feedbackCompleted] =
      await this.prisma.$transaction([
        this.prisma.account.findUnique({ where: { id: accountId } }),
        this.prisma.building.findUnique({ where: { id: bId } }),
        this.prisma.accountBuilding.count({ where: { buildingId: bId } }),
        this.prisma.notification.count({
          where: { buildingId: bId, reads: { none: { accountId } } },
        }),
        this.prisma.feedback.count({ where: { buildingId: bId, status: 'PROCESSING' } }),
        this.prisma.feedback.count({ where: { buildingId: bId } }),
        this.prisma.feedback.count({ where: { buildingId: bId, status: 'COMPLETED' } }),
      ]);

    const [recentNotifications, communityPosts, upcomingEvents] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { buildingId: bId },
        orderBy: [{ isUrgent: 'desc' }, { publishedAt: 'desc' }],
        take: 4,
        include: { reads: { where: { accountId }, select: { id: true } } },
      }),
      this.prisma.communityPost.findMany({
        where: { buildingId: bId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      this.prisma.event.findMany({
        where: { buildingId: bId, startAt: { gte: new Date() } },
        orderBy: { startAt: 'asc' },
        take: 5,
      }),
    ]);

    const onTimeRate = feedbackTotal > 0
      ? Math.round((feedbackCompleted / feedbackTotal) * 100)
      : null;

    // Transparency-section figures (now available)
    const [latestPeriod, fund] = await this.prisma.$transaction([
      this.prisma.financialPeriod.findFirst({
        where: { buildingId: bId },
        orderBy: { period: 'desc' },
      }),
      this.prisma.maintenanceFund.findUnique({ where: { buildingId: bId } }),
    ]);

    return {
      hero: {
        greeting: this.greeting(account?.fullName),
        buildingName: building?.name ?? null,
        residentsCount: residents,
        unreadNotifications: unread,
      },
      // Financial cards belong to the deferred "Báo cáo minh bạch" section.
      stats: [
        {
          key: 'income_expense',
          label: 'Thu chi tháng này',
          value: latestPeriod ? Number(latestPeriod.surplus) : null,
          unit: 'đ',
          changePercent: latestPeriod?.surplusChangePct ?? null,
        },
        {
          key: 'maintenance_fund',
          label: 'Quỹ bảo trì',
          value: fund ? Number(fund.balance) : null,
          unit: 'đ',
          changePercent: fund?.balanceChangePct ?? null,
        },
        { key: 'feedback_processing', label: 'Phản ánh đang xử lý', value: feedbackProcessing },
        { key: 'on_time_rate', label: 'Tỉ lệ xử lý đúng hạn', value: onTimeRate, unit: '%' },
      ],
      notifications: recentNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        source: n.authorName ?? 'Ban quản trị',
        category: n.category.toLowerCase(),
        iconType: n.iconType.toLowerCase(),
        isUrgent: n.isUrgent,
        status: n.reads.length > 0 ? 'read' : 'unread',
        time: n.publishedAt,
      })),
      communityPosts: communityPosts.map((p) => ({
        id: p.id,
        title: p.title,
        thumbnailUrl: p.thumbnailUrl,
        viewCount: p.viewCount,
        createdAt: p.createdAt,
      })),
      events: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        startAt: e.startAt,
        endAt: e.endAt,
        location: e.location,
      })),
    };
  }

  private greeting(name?: string | null): string {
    const hour = new Date().getHours();
    const part =
      hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    const firstName = name?.split(' ').pop() ?? 'bạn';
    return `${part}, ${firstName}!`;
  }
}
