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
import { ProfileService } from './profile.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateVehicleDto, VehicleDto } from './dto/vehicle.dto';
import {
  EmergencyContactDto,
  UpdateEmergencyContactDto,
} from './dto/emergency-contact.dto';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Hồ sơ cá nhân + phương tiện, liên hệ, hoạt động' })
  me(@CurrentUser('accountId') accountId: string) {
    return this.service.me(accountId);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật hồ sơ cá nhân' })
  update(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.service.update(accountId, dto);
  }

  // ── Vehicles ────────────────────────────────────────────────

  @Post('vehicles')
  @ApiOperation({ summary: 'Thêm phương tiện' })
  addVehicle(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: VehicleDto,
  ) {
    return this.service.addVehicle(accountId, dto);
  }

  @Patch('vehicles/:id')
  @ApiOperation({ summary: 'Cập nhật phương tiện' })
  updateVehicle(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.service.updateVehicle(accountId, id, dto);
  }

  @Delete('vehicles/:id')
  @ApiOperation({ summary: 'Xóa phương tiện' })
  removeVehicle(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.removeVehicle(accountId, id);
  }

  // ── Emergency contacts ──────────────────────────────────────

  @Post('contacts')
  @ApiOperation({ summary: 'Thêm liên hệ khẩn cấp' })
  addContact(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: EmergencyContactDto,
  ) {
    return this.service.addContact(accountId, dto);
  }

  @Patch('contacts/:id')
  @ApiOperation({ summary: 'Cập nhật liên hệ khẩn cấp' })
  updateContact(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmergencyContactDto,
  ) {
    return this.service.updateContact(accountId, id, dto);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Xóa liên hệ khẩn cấp' })
  removeContact(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.removeContact(accountId, id);
  }

  // ── Activity ────────────────────────────────────────────────

  @Get('activities')
  @ApiOperation({ summary: 'Lịch sử hoạt động' })
  activities(@CurrentUser('accountId') accountId: string) {
    return this.service.activities(accountId);
  }
}
