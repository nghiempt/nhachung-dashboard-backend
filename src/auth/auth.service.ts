import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface DeviceContext {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Public flows ────────────────────────────────────────────

  async signUp(dto: SignUpDto, device: DeviceContext) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.account.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create account + 1-1 profile + settings + default notification toggles
    const account = await this.prisma.account.create({
      data: {
        email,
        password: passwordHash,
        fullName: dto.fullName,
        companyName: dto.companyName,
        referralCode: dto.referralCode,
        profile: {
          create: {
            fullName: dto.fullName,
            email,
            completionPercentage: 20,
          },
        },
        settings: {
          create: {
            notificationSettings: {
              create: this.defaultNotificationSettings(),
            },
          },
        },
      },
    });

    const tokens = await this.issueSession(account.id, account.email, device);
    return { account: this.sanitize(account), ...tokens };
  }

  async signIn(dto: SignInDto, device: DeviceContext) {
    const email = dto.email.toLowerCase().trim();
    const account = await this.prisma.account.findUnique({ where: { email } });
    // Treat DELETED/HIDDEN as non-existent to avoid leaking account state.
    if (!account || account.status === 'DELETED' || account.status === 'HIDDEN') {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const ok = await bcrypt.compare(dto.password, account.password);
    if (!ok) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (account.status === 'SUSPENDED') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const tokens = await this.issueSession(account.id, account.email, device);
    return { account: this.sanitize(account), ...tokens };
  }

  async refresh(refreshToken: string, device: DeviceContext) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt < new Date() ||
      !(await bcrypt.compare(refreshToken, session.refreshTokenHash))
    ) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }

    // Rotate refresh token
    const tokens = await this.signTokens(session.accountId, payload.email, session.id);
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
        lastActiveAt: new Date(),
        ip: device.ip ?? session.ip,
        userAgent: device.userAgent ?? session.userAgent,
      },
    });
    return tokens;
  }

  async logout(sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  // ── Session helpers ─────────────────────────────────────────

  private async issueSession(
    accountId: string,
    email: string,
    device: DeviceContext,
  ) {
    const { deviceName, deviceOs } = this.parseUserAgent(device.userAgent);
    const ttlDays = this.refreshTtlDays();
    const session = await this.prisma.session.create({
      data: {
        accountId,
        refreshTokenHash: '',
        deviceName,
        deviceOs,
        userAgent: device.userAgent,
        ip: device.ip,
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
    });
    const tokens = await this.signTokens(accountId, email, session.id);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
    });
    return tokens;
  }

  private async signTokens(accountId: string, email: string, sessionId: string) {
    const payload: JwtPayload = { sub: accountId, email, sid: sessionId };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '30d'),
    });
    return { accessToken, refreshToken };
  }

  private refreshTtlDays(): number {
    const ttl = this.config.get<string>('JWT_REFRESH_TTL', '30d');
    const match = /^(\d+)d$/.exec(ttl);
    return match ? parseInt(match[1], 10) : 30;
  }

  private parseUserAgent(ua?: string): { deviceName: string; deviceOs: string } {
    if (!ua) return { deviceName: 'Thiết bị không xác định', deviceOs: '—' };
    let deviceOs = 'Unknown';
    if (/iphone|ipad|ios/i.test(ua)) deviceOs = 'iOS';
    else if (/android/i.test(ua)) deviceOs = 'Android';
    else if (/mac os|macintosh/i.test(ua)) deviceOs = 'macOS';
    else if (/windows/i.test(ua)) deviceOs = 'Windows';
    else if (/linux/i.test(ua)) deviceOs = 'Linux';

    let deviceName = 'Trình duyệt';
    if (/iphone/i.test(ua)) deviceName = 'iPhone';
    else if (/ipad/i.test(ua)) deviceName = 'iPad';
    else if (/macintosh/i.test(ua)) deviceName = 'MacBook';
    else if (/android/i.test(ua)) deviceName = 'Android';
    else if (/windows/i.test(ua)) deviceName = 'Windows PC';
    else if (/chrome/i.test(ua)) deviceName = 'Chrome';
    else if (/firefox/i.test(ua)) deviceName = 'Firefox';
    else if (/safari/i.test(ua)) deviceName = 'Safari';
    return { deviceName, deviceOs };
  }

  private defaultNotificationSettings() {
    return [
      { key: 'fee', label: 'Thông báo phí quản lý', description: 'Nhắc khi đến kỳ thanh toán và xác nhận đã thu', isEnabled: true },
      { key: 'maintenance', label: 'Bảo trì & Sửa chữa', description: 'Lịch bảo trì, sửa chữa ảnh hưởng căn hộ', isEnabled: true },
      { key: 'emergency', label: 'Thông báo khẩn cấp', description: 'Cảnh báo an ninh, sự cố nghiêm trọng', isEnabled: true, isLocked: true },
      { key: 'event', label: 'Sự kiện cộng đồng', description: 'Hoạt động, sự kiện của cư dân', isEnabled: true },
      { key: 'document', label: 'Tài liệu & Thông tin mới', description: 'Tài liệu, biên bản, thông tin mới được đăng', isEnabled: false },
    ];
  }

  private sanitize(account: { password?: string } & Record<string, any>) {
    const { password, ...rest } = account;
    return rest;
  }
}
