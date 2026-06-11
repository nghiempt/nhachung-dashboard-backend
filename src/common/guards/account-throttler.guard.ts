import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * Rate-limit by the authenticated account when available, otherwise by client
 * IP. This keeps per-user limits (e.g. AI chat) fair behind a shared proxy and
 * still throttles unauthenticated traffic (sign-in, refresh) by source IP.
 */
@Injectable()
export class AccountThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user as AuthUser | undefined;
    if (user?.accountId) return `acc:${user.accountId}`;
    const forwarded = (req.headers?.['x-forwarded-for'] as string)
      ?.split(',')[0]
      ?.trim();
    return forwarded || req.ip || 'unknown';
  }
}
