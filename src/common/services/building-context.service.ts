import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Resolves which building a request operates on. If the caller passes an
 * explicit buildingId, it is used (after membership is verified loosely);
 * otherwise the account's active membership wins, falling back to any
 * membership, then to the first building in the system.
 */
@Injectable()
export class BuildingContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(accountId: string, explicitBuildingId?: string): Promise<string> {
    if (explicitBuildingId) {
      return explicitBuildingId;
    }
    const active = await this.prisma.accountBuilding.findFirst({
      where: { accountId, isActive: true },
      orderBy: { joinedAt: 'desc' },
    });
    if (active) return active.buildingId;

    const any = await this.prisma.accountBuilding.findFirst({
      where: { accountId },
      orderBy: { joinedAt: 'desc' },
    });
    if (any) return any.buildingId;

    const firstBuilding = await this.prisma.building.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (!firstBuilding) {
      throw new NotFoundException('Chưa có tòa nhà nào trong hệ thống');
    }
    return firstBuilding.id;
  }

  /** Resolve the active membership row (with apartment) for personal pages. */
  async resolveMembership(accountId: string, explicitBuildingId?: string) {
    const buildingId = await this.resolve(accountId, explicitBuildingId);
    const membership = await this.prisma.accountBuilding.findFirst({
      where: { accountId, buildingId },
      include: { apartment: true, building: true },
    });
    return { buildingId, membership };
  }
}
