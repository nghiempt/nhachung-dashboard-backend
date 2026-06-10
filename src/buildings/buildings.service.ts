import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BuildingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Buildings the account belongs to ("Của tôi") + the rest ("Khám phá"). */
  async list(accountId: string) {
    const [memberships, allBuildings] = await this.prisma.$transaction([
      this.prisma.accountBuilding.findMany({
        where: { accountId },
        include: { building: true, apartment: true },
      }),
      this.prisma.building.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);

    const membershipMap = new Map(memberships.map((m) => [m.buildingId, m]));

    const mine = memberships.map((m) => ({
      id: m.building.id,
      name: m.building.name,
      location: m.building.location,
      apartment: m.apartment?.code ?? null,
      thumbnailUrl: m.building.thumbnailUrl,
      isOwned: true,
      isOwner: m.isOwner,
      isActive: m.isActive,
      role: m.role,
    }));

    const explore = allBuildings
      .filter((b) => !membershipMap.has(b.id))
      .map((b) => ({
        id: b.id,
        name: b.name,
        location: b.location,
        apartment: null,
        thumbnailUrl: b.thumbnailUrl,
        isOwned: false,
        isOwner: false,
        isActive: false,
        role: null as string | null,
      }));

    const active = mine.find((b) => b.isActive) ?? mine[0] ?? null;
    return { active, mine, explore };
  }

  async detail(accountId: string, id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        _count: { select: { memberships: true, notifications: true } },
      },
    });
    if (!building) throw new NotFoundException('Không tìm thấy tòa nhà');
    const membership = await this.prisma.accountBuilding.findFirst({
      where: { accountId, buildingId: id },
      include: { apartment: true },
    });
    return {
      id: building.id,
      name: building.name,
      location: building.location,
      address: building.address,
      thumbnailUrl: building.thumbnailUrl,
      description: building.description,
      status: building.status,
      totalResidents: building._count.memberships,
      totalNotifications: building._count.notifications,
      isOwned: !!membership,
      apartment: membership?.apartment?.code ?? null,
    };
  }

  /** Switch the active building for the account. */
  async setActive(accountId: string, buildingId: string) {
    const membership = await this.prisma.accountBuilding.findFirst({
      where: { accountId, buildingId },
    });
    if (!membership) {
      throw new NotFoundException('Bạn chưa tham gia tòa nhà này');
    }
    await this.prisma.$transaction([
      this.prisma.accountBuilding.updateMany({
        where: { accountId, isActive: true },
        data: { isActive: false },
      }),
      this.prisma.accountBuilding.update({
        where: { id: membership.id },
        data: { isActive: true },
      }),
    ]);
    return { success: true, activeBuildingId: buildingId };
  }
}
