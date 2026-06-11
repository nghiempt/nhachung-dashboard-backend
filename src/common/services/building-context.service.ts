import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Resolves which building a request operates on. If the caller passes an
 * explicit buildingId, it is used only after verifying the account is a
 * member of that building; otherwise the account's active membership wins,
 * falling back to any membership, then to the first building in the system.
 */
@Injectable()
export class BuildingContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(accountId: string, explicitBuildingId?: string): Promise<string> {
    if (explicitBuildingId) {
      const member = await this.prisma.accountBuilding.findFirst({
        where: { accountId, buildingId: explicitBuildingId },
      });
      if (!member) {
        throw new ForbiddenException('Không có quyền truy cập tòa nhà này');
      }
      return member.buildingId;
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

  /**
   * Resolve the building an admin manages. Prefers the active membership when
   * its role is one of `roles`, otherwise the most recent membership with a
   * matching role. Returns null when the account holds no such role — callers
   * (the RolesGuard) translate that into a 403.
   */
  async resolveAdminBuilding(
    accountId: string,
    roles: readonly string[],
    explicitBuildingId?: string,
  ): Promise<string | null> {
    const roleFilter = { role: { in: [...roles] } };

    if (explicitBuildingId) {
      const scoped = await this.prisma.accountBuilding.findFirst({
        where: { accountId, buildingId: explicitBuildingId, ...roleFilter },
      });
      return scoped ? scoped.buildingId : null;
    }

    const active = await this.prisma.accountBuilding.findFirst({
      where: { accountId, isActive: true, ...roleFilter },
      orderBy: { joinedAt: 'desc' },
    });
    if (active) return active.buildingId;

    const any = await this.prisma.accountBuilding.findFirst({
      where: { accountId, ...roleFilter },
      orderBy: { joinedAt: 'desc' },
    });
    return any ? any.buildingId : null;
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
