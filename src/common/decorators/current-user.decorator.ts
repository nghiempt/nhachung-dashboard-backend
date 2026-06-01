import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  accountId: string;
  email: string;
  sessionId: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    return data ? user?.[data] : user;
  },
);
