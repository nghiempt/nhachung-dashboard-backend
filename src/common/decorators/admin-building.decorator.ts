import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the building id the admin caller manages, resolved by
 * {@link RolesGuard} from the membership role. Only valid on routes guarded by
 * `@Roles(...)`.
 */
export const AdminBuilding = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.adminBuildingId as string;
  },
);
