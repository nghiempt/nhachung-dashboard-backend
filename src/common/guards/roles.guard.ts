import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { BuildingContextService } from '../services/building-context.service';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * Enforces `@Roles(...)`. Runs after {@link JwtAuthGuard}, so `request.user`
 * is already populated. Resolves the building the caller manages with a
 * matching membership role and stashes it on `request.adminBuildingId` for the
 * `@AdminBuilding()` param decorator. Routes without `@Roles` pass through.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly ctx: BuildingContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    if (!user?.accountId) {
      throw new ForbiddenException('Yêu cầu xác thực');
    }

    const explicit =
      (request.query?.buildingId as string | undefined) ||
      (request.headers?.['x-building-id'] as string | undefined);

    const buildingId = await this.ctx.resolveAdminBuilding(
      user.accountId,
      required,
      explicit,
    );
    if (!buildingId) {
      throw new ForbiddenException('Bạn không có quyền quản trị tòa nhà này');
    }

    request.adminBuildingId = buildingId;
    return true;
  }
}
