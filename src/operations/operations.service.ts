import { Injectable } from '@nestjs/common';
import { Prisma, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { paginate } from '../common/dto/pagination.dto';
import { QueryWorkOrdersDto } from './dto/query-work-orders.dto';

@Injectable()
export class OperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** Stats by status + category distribution for the overview header. */
  async overview(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const [total, processing, completed, overdue, categories] =
      await this.prisma.$transaction([
        this.prisma.workOrder.count({ where: { buildingId: bId } }),
        this.prisma.workOrder.count({
          where: { buildingId: bId, status: WorkOrderStatus.PROCESSING },
        }),
        this.prisma.workOrder.count({
          where: { buildingId: bId, status: WorkOrderStatus.COMPLETED },
        }),
        this.prisma.workOrder.count({
          where: { buildingId: bId, status: WorkOrderStatus.OVERDUE },
        }),
        this.prisma.workOrder.groupBy({
          by: ['category'],
          where: { buildingId: bId },
          _count: true,
          orderBy: { category: 'asc' },
        }),
      ]);

    return {
      stats: { total, processing, completed, overdue },
      categoryDistribution: categories.map((c) => ({
        category: c.category.toLowerCase(),
        count: c._count,
      })),
    };
  }

  /** Paginated work orders, optional status filter, newest occurred first. */
  async workOrders(accountId: string, query: QueryWorkOrdersDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.WorkOrderWhereInput = { buildingId };
    if (query.status)
      where.status = query.status.toUpperCase() as WorkOrderStatus;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.workOrder.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    const items = rows.map((w) => ({
      id: w.id,
      code: w.code,
      name: w.name,
      category: w.category.toLowerCase(),
      status: w.status.toLowerCase(),
      priority: w.priority.toLowerCase(),
      requesterName: w.requesterName,
      requesterInitials: w.requesterInitials,
      overdueDays: w.overdueDays,
      occurredAt: w.occurredAt,
    }));

    return paginate(items, total, query.page, query.limit);
  }

  /** Building systems ordered by sortOrder. */
  async systems(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const rows = await this.prisma.buildingSystem.findMany({
      where: { buildingId: bId },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      detail: s.detail,
      status: s.status.toLowerCase(),
      metric: s.metric,
      lastCheckedAt: s.lastCheckedAt,
    }));
  }

  /** Weekly maintenance schedule (jobs with scheduledAt set). */
  async schedule(accountId: string, buildingId?: string) {
    const bId = await this.ctx.resolve(accountId, buildingId);

    const rows = await this.prisma.maintenanceJob.findMany({
      where: { buildingId: bId, scheduledAt: { not: null } },
      orderBy: { scheduledAt: 'asc' },
    });

    return rows.map((j) => ({
      id: j.id,
      name: j.name,
      contractor: j.contractor,
      category: j.category,
      scheduledAt: j.scheduledAt,
      scheduledPeriod: j.scheduledPeriod,
      status: j.status.toLowerCase(),
    }));
  }
}
