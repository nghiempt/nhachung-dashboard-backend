import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { NotificationToggleDto } from './dto/notification-toggle.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Cài đặt tài khoản + thông báo' })
  get(@CurrentUser('accountId') accountId: string) {
    return this.service.get(accountId);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật ngôn ngữ / giao diện / 2FA' })
  update(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.service.update(accountId, dto);
  }

  @Patch('notifications/:key')
  @ApiOperation({ summary: 'Bật/tắt một loại thông báo' })
  toggleNotification(
    @CurrentUser('accountId') accountId: string,
    @Param('key') key: string,
    @Body() dto: NotificationToggleDto,
  ) {
    return this.service.toggleNotification(accountId, key, dto.isEnabled);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  changePassword(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.service.changePassword(accountId, dto);
  }

  // ── Devices ─────────────────────────────────────────────────

  @Get('devices')
  @ApiOperation({ summary: 'Danh sách thiết bị đang đăng nhập' })
  listDevices(
    @CurrentUser('accountId') accountId: string,
    @CurrentUser('sessionId') sessionId: string,
  ) {
    return this.service.listDevices(accountId, sessionId);
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Đăng xuất một thiết bị' })
  revokeDevice(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.revokeDevice(accountId, id);
  }

  @Post('devices/revoke-others')
  @ApiOperation({ summary: 'Đăng xuất tất cả thiết bị khác' })
  revokeOthers(
    @CurrentUser('accountId') accountId: string,
    @CurrentUser('sessionId') sessionId: string,
  ) {
    return this.service.revokeAllOther(accountId, sessionId);
  }

  @Delete('account')
  @ApiOperation({ summary: 'Xóa tài khoản (soft delete)' })
  softDelete(@CurrentUser('accountId') accountId: string) {
    return this.service.softDeleteAccount(accountId);
  }
}
