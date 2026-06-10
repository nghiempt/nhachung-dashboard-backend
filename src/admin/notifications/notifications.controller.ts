import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminNotificationsService } from './notifications.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateNotificationDto,
  QueryNotificationsDto,
  UpdateNotificationDto,
} from './dto/notifications.dto';

@ApiTags('admin/notifications')
@ApiBearerAuth()
@Roles()
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly service: AdminNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo (admin)' })
  list(
    @AdminBuilding() buildingId: string,
    @Query() query: QueryNotificationsDto,
  ) {
    return this.service.list(buildingId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê thông báo' })
  stats(@AdminBuilding() buildingId: string) {
    return this.service.stats(buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thông báo' })
  detail(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.detail(buildingId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo & phát thông báo' })
  create(
    @AdminBuilding() buildingId: string,
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.service.create(buildingId, accountId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông báo' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  remove(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.remove(buildingId, id);
  }
}
