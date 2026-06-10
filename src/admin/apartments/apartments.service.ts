import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  CreateApartmentDto,
  QueryApartmentsDto,
  UpdateApartmentDto,
} from './dto/apartments.dto';

@Injectable()
export class AdminApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(buildingId: string, query: QueryApartmentsDto) {
    const where: Prisma.ApartmentWhereInput = { buildingId };
    if (query.block) where.block = query.block;
    if (query.status) where.status = query.status;
    if (query.search) where.code = { contains: query.search, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.apartment.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: query.skip,
        take: query.limit,
        include: { _count: { select: { memberships: true, familyMembers: true } } },
      }),
      this.prisma.apartment.count({ where }),
    ]);

    const items = rows.map((a) => ({
      id: a.id,
      code: a.code,
      block: a.block,
      floor: a.floor,
      areaSqm: a.areaSqm,
      bedrooms: a.bedrooms,
      bathrooms: a.bathrooms,
      status: a.status,
      residentCount: a._count.memberships,
      familyCount: a._count.familyMembers,
    }));
    return paginate(items, total, query.page, query.limit);
  }

  async stats(buildingId: string) {
    const [total, occupied] = await this.prisma.$transaction([
      this.prisma.apartment.count({ where: { buildingId } }),
      this.prisma.apartment.count({
        where: { buildingId, memberships: { some: {} } },
      }),
    ]);
    return { total, occupied, vacant: total - occupied };
  }

  async detail(buildingId: string, id: string) {
    const a = await this.prisma.apartment.findFirst({
      where: { id, buildingId },
      include: {
        contract: true,
        memberships: {
          include: { account: { select: { fullName: true, email: true } } },
        },
      },
    });
    if (!a) throw new NotFoundException('Không tìm thấy căn hộ');
    return a;
  }

  async create(buildingId: string, dto: CreateApartmentDto) {
    const existing = await this.prisma.apartment.findFirst({
      where: { buildingId, code: dto.code },
    });
    if (existing) throw new BadRequestException('Mã căn hộ đã tồn tại');
    return this.prisma.apartment.create({
      data: {
        buildingId,
        code: dto.code,
        block: dto.block,
        floor: dto.floor,
        areaSqm: dto.areaSqm,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        status: dto.status ?? 'active',
      },
    });
  }

  private async ensure(buildingId: string, id: string) {
    const a = await this.prisma.apartment.findFirst({
      where: { id, buildingId },
    });
    if (!a) throw new NotFoundException('Không tìm thấy căn hộ');
    return a;
  }

  async update(buildingId: string, id: string, dto: UpdateApartmentDto) {
    await this.ensure(buildingId, id);
    return this.prisma.apartment.update({
      where: { id },
      data: {
        ...(dto.block !== undefined ? { block: dto.block } : {}),
        ...(dto.floor !== undefined ? { floor: dto.floor } : {}),
        ...(dto.areaSqm !== undefined ? { areaSqm: dto.areaSqm } : {}),
        ...(dto.bedrooms !== undefined ? { bedrooms: dto.bedrooms } : {}),
        ...(dto.bathrooms !== undefined ? { bathrooms: dto.bathrooms } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async remove(buildingId: string, id: string) {
    await this.ensure(buildingId, id);
    await this.prisma.apartment.delete({ where: { id } });
    return { success: true };
  }
}
