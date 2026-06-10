import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  CreateFeeDto,
  IssueAllDto,
  QueryFeesDto,
  UpdateFeeDto,
} from './dto/fees.dto';

@Injectable()
export class AdminFeesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Owner display-name per apartment, for the fee table. */
  private async ownerNames(apartmentIds: string[]) {
    if (!apartmentIds.length) return new Map<string, string>();
    const memberships = await this.prisma.accountBuilding.findMany({
      where: { apartmentId: { in: apartmentIds } },
      orderBy: { isOwner: 'desc' },
      include: { account: { select: { fullName: true } } },
    });
    const map = new Map<string, string>();
    for (const m of memberships) {
      if (m.apartmentId && !map.has(m.apartmentId)) {
        map.set(m.apartmentId, m.account.fullName);
      }
    }
    return map;
  }

  async list(buildingId: string, query: QueryFeesDto) {
    const where: Prisma.ApartmentFeeWhereInput = {
      apartment: { buildingId },
    };
    if (query.period) where.period = query.period;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.apartment = {
        buildingId,
        code: { contains: query.search, mode: 'insensitive' },
      };
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.apartmentFee.findMany({
        where,
        orderBy: [{ period: 'desc' }, { dueDate: 'asc' }],
        skip: query.skip,
        take: query.limit,
        include: { apartment: { select: { id: true, code: true } } },
      }),
      this.prisma.apartmentFee.count({ where }),
    ]);

    const owners = await this.ownerNames(rows.map((r) => r.apartment.id));
    const items = rows.map((f) => ({
      id: f.id,
      apartmentId: f.apartment.id,
      apartmentCode: f.apartment.code,
      ownerName: owners.get(f.apartment.id) ?? null,
      period: f.period,
      name: f.name,
      amount: f.amount,
      status: f.status.toLowerCase(),
      dueDate: f.dueDate,
      paidAt: f.paidAt,
    }));

    return paginate(items, total, query.page, query.limit);
  }

  async stats(buildingId: string, period?: string) {
    const where: Prisma.ApartmentFeeWhereInput = { apartment: { buildingId } };
    if (period) where.period = period;

    const grouped = await this.prisma.apartmentFee.groupBy({
      by: ['status'],
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });

    let totalReceivable = 0;
    let collected = 0;
    let outstanding = 0;
    let unitsUnpaid = 0;
    for (const g of grouped) {
      const sum = g._sum.amount ?? 0;
      totalReceivable += sum;
      if (g.status === PaymentStatus.PAID) collected += sum;
      else {
        outstanding += sum;
        unitsUnpaid += g._count._all;
      }
    }
    return {
      period: period ?? null,
      totalReceivable,
      collected,
      outstanding,
      unitsUnpaid,
      collectionRate:
        totalReceivable > 0 ? Math.round((collected / totalReceivable) * 1000) / 10 : 0,
    };
  }

  private async resolveApartment(buildingId: string, code: string) {
    const apt = await this.prisma.apartment.findFirst({
      where: { buildingId, code },
    });
    if (!apt) throw new BadRequestException(`Không tìm thấy căn hộ ${code}`);
    return apt;
  }

  async create(buildingId: string, dto: CreateFeeDto) {
    const apt = await this.resolveApartment(buildingId, dto.apartmentCode);
    const fee = await this.prisma.apartmentFee.create({
      data: {
        apartmentId: apt.id,
        period: dto.period,
        name: dto.name,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
    return this.detail(buildingId, fee.id);
  }

  /** Issue the same fee to every apartment in the building for a period. */
  async issueAll(buildingId: string, dto: IssueAllDto) {
    const apartments = await this.prisma.apartment.findMany({
      where: { buildingId },
      select: { id: true },
    });
    const existing = await this.prisma.apartmentFee.findMany({
      where: { period: dto.period, name: dto.name, apartment: { buildingId } },
      select: { apartmentId: true },
    });
    const skip = new Set(existing.map((e) => e.apartmentId));
    const toCreate = apartments.filter((a) => !skip.has(a.id));

    if (toCreate.length) {
      await this.prisma.apartmentFee.createMany({
        data: toCreate.map((a) => ({
          apartmentId: a.id,
          period: dto.period,
          name: dto.name,
          amount: dto.amount,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        })),
      });
    }
    return { created: toCreate.length, skipped: skip.size };
  }

  async detail(buildingId: string, id: string) {
    const fee = await this.prisma.apartmentFee.findFirst({
      where: { id, apartment: { buildingId } },
      include: { apartment: { select: { id: true, code: true } } },
    });
    if (!fee) throw new NotFoundException('Không tìm thấy hóa đơn');
    const owners = await this.ownerNames([fee.apartment.id]);
    return {
      id: fee.id,
      apartmentId: fee.apartment.id,
      apartmentCode: fee.apartment.code,
      ownerName: owners.get(fee.apartment.id) ?? null,
      period: fee.period,
      name: fee.name,
      amount: fee.amount,
      status: fee.status.toLowerCase(),
      dueDate: fee.dueDate,
      paidAt: fee.paidAt,
    };
  }

  private async ensureFee(buildingId: string, id: string) {
    const fee = await this.prisma.apartmentFee.findFirst({
      where: { id, apartment: { buildingId } },
    });
    if (!fee) throw new NotFoundException('Không tìm thấy hóa đơn');
    return fee;
  }

  async update(buildingId: string, id: string, dto: UpdateFeeDto) {
    await this.ensureFee(buildingId, id);
    await this.prisma.apartmentFee.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.dueDate !== undefined ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.status !== undefined
          ? {
              status: dto.status,
              paidAt: dto.status === PaymentStatus.PAID ? new Date() : null,
            }
          : {}),
      },
    });
    return this.detail(buildingId, id);
  }

  async markPaid(buildingId: string, id: string) {
    await this.ensureFee(buildingId, id);
    await this.prisma.apartmentFee.update({
      where: { id },
      data: { status: PaymentStatus.PAID, paidAt: new Date() },
    });
    return this.detail(buildingId, id);
  }

  async remove(buildingId: string, id: string) {
    await this.ensureFee(buildingId, id);
    await this.prisma.apartmentFee.delete({ where: { id } });
    return { success: true };
  }
}
