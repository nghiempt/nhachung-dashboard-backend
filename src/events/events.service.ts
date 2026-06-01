import { Injectable, NotFoundException } from '@nestjs/common';
import { Event, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { QueryEventsDto } from './dto/query-events.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  async list(accountId: string, query: QueryEventsDto) {
    const buildingId = await this.ctx.resolve(accountId, query.buildingId);

    const where: Prisma.EventWhereInput = { buildingId };

    if (query.month) {
      const [year, month] = query.month.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      where.startAt = { gte: start, lt: end };
    } else if (query.upcoming) {
      where.startAt = { gte: new Date() };
    }

    const rows = await this.prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
    });

    return rows.map((e) => this.toItem(e));
  }

  async detail(accountId: string, id: string) {
    const buildingId = await this.ctx.resolve(accountId);
    const e = await this.prisma.event.findFirst({
      where: { id, buildingId },
    });
    if (!e) throw new NotFoundException('Không tìm thấy sự kiện');
    return this.toItem(e);
  }

  // ── mappers ─────────────────────────────────────────────────

  private toItem(e: Event) {
    return {
      id: e.id,
      title: e.title,
      content: e.content,
      startAt: e.startAt,
      endAt: e.endAt,
      location: e.location,
      regulations: e.regulations,
      status: e.status.toLowerCase(),
    };
  }
}
