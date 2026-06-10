import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'requiredRoles';

/** Membership roles that may use the admin (management) API surface. */
export const ADMIN_ROLES = ['admin', 'manager'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/**
 * Restrict a route (or controller) to accounts whose membership role on the
 * resolved building is one of the given roles. Enforced by {@link RolesGuard}.
 * Defaults to the admin roles when called with no arguments.
 */
export const Roles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles.length ? roles : [...ADMIN_ROLES]);
