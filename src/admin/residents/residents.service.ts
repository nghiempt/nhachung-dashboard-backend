import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  CreateResidentDto,
  QueryResidentsDto,
  UpdateResidentDto,
} from './dto/residents.dto';

/**
 * Admin management of building residents. A "resident" here is an
 * AccountBuilding membership scoped to the admin's building, joined with the
 * underlying account + profile + apartment.
 */
@Injectable()
export class AdminResidentsService {
  constructor(private readonly prisma: PrismaService) {}

  private displayRole(m: { role: string; isOwner: boolean }): string {
    if (m.role === 'admin' || m.role === 'manager') return m.role;
    return m.isOwner ? 'owner' : 'member';
  }

  private toItem(m: MembershipWithRelations) {
    const profile = m.account.profile;
    return {
      id: m.id,
      accountId: m.accountId,
      fullName: m.account.fullName,
      email: m.account.email,
      avatarUrl: profile?.avatarUrl ?? null,
      phoneNumber: profile?.phoneNumber ?? null,
      apartmentId: m.apartmentId,
      apartmentCode: m.apartment?.code ?? null,
      role: m.role,
      isOwner: m.isOwner,
      displayRole: this.displayRole(m),
      verified: profile?.isVerifiedResident ?? false,
      status: profile?.isVerifiedResident ? 'verified' : 'pending',
      joinedAt: m.joinedAt,
    };
  }

  async list(buildingId: string, query: QueryResidentsDto) {
    const where: Prisma.AccountBuildingWhereInput = { buildingId };

    if (query.role) where.role = query.role;
    if (query.status === 'verified')
      where.account = { profile: { isVerifiedResident: true } };
    if (query.status === 'pending')
      where.account = {
        OR: [
          { profile: { isVerifiedResident: false } },
          { profile: null },
        ],
      };
    if (query.search) {
      const s = query.search;
      where.account = {
        ...(where.account as Prisma.AccountWhereInput),
        OR: [
          { fullName: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { profile: { phoneNumber: { contains: s, mode: 'insensitive' } } },
        ],
      };
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.accountBuilding.findMany({
        where,
        orderBy: { joinedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { account: { include: { profile: true } }, apartment: true },
      }),
      this.prisma.accountBuilding.count({ where }),
    ]);

    // apartment-code search is applied in-memory (relation OR above can't span it cleanly)
    let items = rows.map((r) => this.toItem(r));
    if (query.search) {
      const s = query.search.toLowerCase();
      const matchedIds = new Set(items.filter((i) => i.apartmentCode?.toLowerCase().includes(s)).map((i) => i.id));
      // keep DB matches plus apartment-code matches already in the page
      items = items.filter(
        (i) =>
          matchedIds.has(i.id) ||
          i.fullName.toLowerCase().includes(s) ||
          i.email.toLowerCase().includes(s) ||
          (i.phoneNumber ?? '').toLowerCase().includes(s),
      );
    }

    return paginate(items, total, query.page, query.limit);
  }

  async stats(buildingId: string) {
    const [total, owners, verified] = await this.prisma.$transaction([
      this.prisma.accountBuilding.count({ where: { buildingId } }),
      this.prisma.accountBuilding.count({ where: { buildingId, isOwner: true } }),
      this.prisma.accountBuilding.count({
        where: { buildingId, account: { profile: { isVerifiedResident: true } } },
      }),
    ]);
    return { total, owners, verified, pending: total - verified };
  }

  async detail(buildingId: string, id: string) {
    const m = await this.prisma.accountBuilding.findFirst({
      where: { id, buildingId },
      include: { account: { include: { profile: true } }, apartment: true },
    });
    if (!m) throw new NotFoundException('Không tìm thấy cư dân');
    return this.toItem(m);
  }

  private async resolveApartmentId(buildingId: string, code?: string) {
    if (!code) return undefined;
    const apt = await this.prisma.apartment.findFirst({
      where: { buildingId, code },
    });
    if (!apt) throw new BadRequestException(`Không tìm thấy căn hộ ${code}`);
    return apt.id;
  }

  async create(buildingId: string, dto: CreateResidentDto) {
    const apartmentId = await this.resolveApartmentId(buildingId, dto.apartmentCode);

    // Reuse an existing account by email, otherwise provision a new one.
    let account = await this.prisma.account.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!account) {
      const tempPassword = await bcrypt.hash(nanoid(16), 10);
      account = await this.prisma.account.create({
        data: {
          email: dto.email,
          password: tempPassword,
          fullName: dto.fullName,
          profile: {
            create: {
              fullName: dto.fullName,
              phoneNumber: dto.phoneNumber,
            },
          },
        },
        include: { profile: true },
      });
    } else if (dto.phoneNumber && account.profileId) {
      await this.prisma.accountProfile.update({
        where: { id: account.profileId },
        data: { phoneNumber: dto.phoneNumber },
      });
    }

    const existing = await this.prisma.accountBuilding.findUnique({
      where: { accountId_buildingId: { accountId: account.id, buildingId } },
    });
    if (existing) {
      throw new BadRequestException('Cư dân đã thuộc tòa nhà này');
    }

    const membership = await this.prisma.accountBuilding.create({
      data: {
        accountId: account.id,
        buildingId,
        apartmentId,
        role: dto.role ?? 'resident',
        isOwner: dto.isOwner ?? false,
      },
      include: { account: { include: { profile: true } }, apartment: true },
    });
    return this.toItem(membership);
  }

  private async getMembership(buildingId: string, id: string) {
    const m = await this.prisma.accountBuilding.findFirst({
      where: { id, buildingId },
      include: { account: true },
    });
    if (!m) throw new NotFoundException('Không tìm thấy cư dân');
    return m;
  }

  async update(buildingId: string, id: string, dto: UpdateResidentDto) {
    const m = await this.getMembership(buildingId, id);
    const apartmentId = await this.resolveApartmentId(buildingId, dto.apartmentCode);

    if (dto.fullName !== undefined || dto.phoneNumber !== undefined) {
      if (dto.fullName !== undefined) {
        await this.prisma.account.update({
          where: { id: m.accountId },
          data: { fullName: dto.fullName },
        });
      }
      // ensure a profile exists, then update name/phone
      const account = await this.prisma.account.findUnique({
        where: { id: m.accountId },
      });
      const profileData = {
        ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
        ...(dto.phoneNumber !== undefined ? { phoneNumber: dto.phoneNumber } : {}),
      };
      if (account?.profileId) {
        await this.prisma.accountProfile.update({
          where: { id: account.profileId },
          data: profileData,
        });
      } else if (dto.fullName !== undefined || dto.phoneNumber !== undefined) {
        const profile = await this.prisma.accountProfile.create({
          data: { fullName: dto.fullName ?? m.account.fullName, phoneNumber: dto.phoneNumber },
        });
        await this.prisma.account.update({
          where: { id: m.accountId },
          data: { profileId: profile.id },
        });
      }
    }

    await this.prisma.accountBuilding.update({
      where: { id },
      data: {
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isOwner !== undefined ? { isOwner: dto.isOwner } : {}),
        ...(apartmentId !== undefined ? { apartmentId } : {}),
      },
    });

    return this.detail(buildingId, id);
  }

  async setRole(buildingId: string, id: string, role: string) {
    await this.getMembership(buildingId, id);
    await this.prisma.accountBuilding.update({ where: { id }, data: { role } });
    return this.detail(buildingId, id);
  }

  async verify(buildingId: string, id: string) {
    const m = await this.getMembership(buildingId, id);
    const account = await this.prisma.account.findUnique({
      where: { id: m.accountId },
    });
    if (account?.profileId) {
      await this.prisma.accountProfile.update({
        where: { id: account.profileId },
        data: { isVerifiedResident: true },
      });
    } else {
      const profile = await this.prisma.accountProfile.create({
        data: { fullName: m.account.fullName, isVerifiedResident: true },
      });
      await this.prisma.account.update({
        where: { id: m.accountId },
        data: { profileId: profile.id },
      });
    }
    return this.detail(buildingId, id);
  }

  async remove(buildingId: string, id: string) {
    await this.getMembership(buildingId, id);
    await this.prisma.accountBuilding.delete({ where: { id } });
    return { success: true };
  }
}

type MembershipWithRelations = Prisma.AccountBuildingGetPayload<{
  include: { account: { include: { profile: true } }; apartment: true };
}>;
