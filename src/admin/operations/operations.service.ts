import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WorkOrderStatus } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  CreateSystemDto,
  CreateWorkOrderDto,
  QueryWorkOrdersDto,
  UpdateSystemDto,
  UpdateWorkOrderDto,
} from './dto/operations.dto';

@Injectable()
export class AdminOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(buildingId: string) {
    const [processing, completed, overdue, systems] =
      await this.prisma.$transaction([
        this.prisma.workOrder.count({
          where: { buildingId, status: WorkOrderStatus.PROCESSING },
        }),
        this.prisma.workOrder.count({
          where: { buildingId, status: WorkOrderStatus.COMPLETED },
        }),
        this.prisma.workOrder.count({
          where: { buildingId, status: WorkOrderStatus.OVERDUE },
        }),
        this.prisma.buildingSystem.count({ where: { buildingId } }),
      ]);
    return { processing, completed, overdue, systems };
  }

  async listWorkOrders(buildingId: string, query: QueryWorkOrdersDto) {
    const where: Prisma.WorkOrderWhereInput = { buildingId };
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

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
      overdueDays: w.overdueDays,
      occurredAt: w.occurredAt,
    }));
    return paginate(items, total, query.page, query.limit);
  }

  async createWorkOrder(buildingId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        buildingId,
        code: `YC-${nanoid(8).toUpperCase()}`,
        name: dto.name,
        category: dto.category,
        priority: dto.priority ?? 'MEDIUM',
        status: dto.status ?? 'PROCESSING',
        requesterName: dto.requesterName,
        requesterInitials: dto.requesterName
          ? dto.requesterName
              .split(' ')
              .map((p) => p[0])
              .slice(-2)
              .join('')
              .toUpperCase()
          : null,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      },
    });
  }

  private async ensureWorkOrder(buildingId: string, id: string) {
    const w = await this.prisma.workOrder.findFirst({
      where: { id, buildingId },
    });
    if (!w) throw new NotFoundException('Không tìm thấy yêu cầu');
    return w;
  }

  async updateWorkOrder(buildingId: string, id: string, dto: UpdateWorkOrderDto) {
    await this.ensureWorkOrder(buildingId, id);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.requesterName !== undefined
          ? { requesterName: dto.requesterName }
          : {}),
      },
    });
  }

  async removeWorkOrder(buildingId: string, id: string) {
    await this.ensureWorkOrder(buildingId, id);
    await this.prisma.workOrder.delete({ where: { id } });
    return { success: true };
  }

  // ── Building systems ──
  async listSystems(buildingId: string) {
    const rows = await this.prisma.buildingSystem.findMany({
      where: { buildingId },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      detail: s.detail,
      status: s.status.toLowerCase(),
      metric: s.metric,
      lastCheckedAt: s.lastCheckedAt,
      sortOrder: s.sortOrder,
    }));
  }

  async createSystem(buildingId: string, dto: CreateSystemDto) {
    return this.prisma.buildingSystem.create({
      data: {
        buildingId,
        name: dto.name,
        detail: dto.detail,
        status: dto.status ?? 'NORMAL',
        metric: dto.metric,
        sortOrder: dto.sortOrder ?? 0,
        lastCheckedAt: new Date(),
      },
    });
  }

  private async ensureSystem(buildingId: string, id: string) {
    const s = await this.prisma.buildingSystem.findFirst({
      where: { id, buildingId },
    });
    if (!s) throw new NotFoundException('Không tìm thấy hệ thống');
    return s;
  }

  async updateSystem(buildingId: string, id: string, dto: UpdateSystemDto) {
    await this.ensureSystem(buildingId, id);
    return this.prisma.buildingSystem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.detail !== undefined ? { detail: dto.detail } : {}),
        ...(dto.status !== undefined
          ? { status: dto.status, lastCheckedAt: new Date() }
          : {}),
        ...(dto.metric !== undefined ? { metric: dto.metric } : {}),
      },
    });
  }

  async removeSystem(buildingId: string, id: string) {
    await this.ensureSystem(buildingId, id);
    await this.prisma.buildingSystem.delete({ where: { id } });
    return { success: true };
  }
}
