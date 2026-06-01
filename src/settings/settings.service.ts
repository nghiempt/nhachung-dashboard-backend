import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Settings ────────────────────────────────────────────────

  /** Returns settings (creating defaults if missing) + notification toggles. */
  async get(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        email: true,
        fullName: true,
        profile: {
          select: { phoneNumber: true, secondaryPhone: true },
        },
      },
    });
    if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

    const settings = await this.getOrCreateSettings(accountId);

    return {
      id: settings.id,
      email: account.email,
      phoneNumber: account.profile?.phoneNumber ?? null,
      secondaryPhone: account.profile?.secondaryPhone ?? null,
      language: settings.language,
      theme: settings.theme.toLowerCase(),
      twoFactorEnabled: settings.twoFactorEnabled,
      passwordChangedAt: settings.passwordChangedAt,
      notificationSettings: settings.notificationSettings.map((n) => ({
        key: n.key,
        label: n.label,
        description: n.description,
        isEnabled: n.isEnabled,
        isLocked: n.isLocked,
      })),
    };
  }

  async update(accountId: string, dto: UpdateSettingsDto) {
    await this.getOrCreateSettings(accountId);
    await this.prisma.accountSettings.update({
      where: { accountId },
      data: {
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.theme !== undefined && { theme: dto.theme }),
        ...(dto.twoFactorEnabled !== undefined && {
          twoFactorEnabled: dto.twoFactorEnabled,
        }),
      },
    });
    return this.get(accountId);
  }

  async toggleNotification(accountId: string, key: string, isEnabled: boolean) {
    const settings = await this.getOrCreateSettings(accountId);
    const setting = settings.notificationSettings.find((n) => n.key === key);
    if (!setting) {
      throw new NotFoundException('Không tìm thấy thiết lập thông báo');
    }
    if (setting.isLocked) {
      throw new BadRequestException('Không thể tắt thông báo này');
    }
    const updated = await this.prisma.accountNotificationSetting.update({
      where: { id: setting.id },
      data: { isEnabled },
    });
    return {
      key: updated.key,
      label: updated.label,
      description: updated.description,
      isEnabled: updated.isEnabled,
      isLocked: updated.isLocked,
    };
  }

  async changePassword(accountId: string, dto: ChangePasswordDto) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, password: true },
    });
    if (!account) throw new NotFoundException('Không tìm thấy tài khoản');

    const ok = await bcrypt.compare(dto.currentPassword, account.password);
    if (!ok) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.account.update({
      where: { id: accountId },
      data: { password: passwordHash },
    });

    await this.getOrCreateSettings(accountId);
    await this.prisma.accountSettings.update({
      where: { accountId },
      data: { passwordChangedAt: new Date() },
    });

    return { success: true };
  }

  // ── Devices (Sessions) ──────────────────────────────────────

  async listDevices(accountId: string, currentSessionId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { accountId, revokedAt: null },
      orderBy: { lastActiveAt: 'desc' },
    });
    return sessions.map((s) => ({
      id: s.id,
      deviceName: s.deviceName,
      deviceOs: s.deviceOs,
      location: s.location,
      ip: s.ip,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.id === currentSessionId,
    }));
  }

  async revokeDevice(accountId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, accountId },
    });
    if (!session) throw new NotFoundException('Không tìm thấy phiên đăng nhập');
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async revokeAllOther(accountId: string, currentSessionId: string) {
    const result = await this.prisma.session.updateMany({
      where: {
        accountId,
        revokedAt: null,
        id: { not: currentSessionId },
      },
      data: { revokedAt: new Date() },
    });
    return { success: true, revoked: result.count };
  }

  // ── Account ─────────────────────────────────────────────────

  async softDeleteAccount(accountId: string) {
    const now = new Date();
    await this.prisma.account.update({
      where: { id: accountId },
      data: { status: 'DELETED', deletedAt: now },
    });
    await this.prisma.session.updateMany({
      where: { accountId, revokedAt: null },
      data: { revokedAt: now },
    });
    return { success: true };
  }

  // ── Helpers ─────────────────────────────────────────────────

  private async getOrCreateSettings(accountId: string) {
    let settings = await this.prisma.accountSettings.findUnique({
      where: { accountId },
      include: { notificationSettings: true },
    });
    if (!settings) {
      settings = await this.prisma.accountSettings.create({
        data: { accountId },
        include: { notificationSettings: true },
      });
    }
    return settings;
  }
}
