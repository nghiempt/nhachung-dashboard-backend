import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string; // accountId
  email: string;
  sid: string; // sessionId
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      include: { account: true },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired or revoked');
    }
    if (session.account.status === 'DELETED' || session.account.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account is not active');
    }
    return {
      accountId: payload.sub,
      email: payload.email,
      sessionId: payload.sid,
    };
  }
}
