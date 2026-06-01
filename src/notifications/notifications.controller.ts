import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo (tab/category/search/paginate)' })
  list(@CurrentUser('accountId') accountId: string, @Query() query: QueryNotificationsDto) {
    return this.service.list(accountId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Đếm theo tab + breakdown danh mục' })
  summary(@CurrentUser('accountId') accountId: string, @Query('buildingId') buildingId?: string) {
    return this.service.summary(accountId, buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thông báo (tự đánh dấu đã đọc + tăng view)' })
  detail(@CurrentUser('accountId') accountId: string, @Param('id') id: string) {
    return this.service.detail(accountId, id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu 1 thông báo đã đọc' })
  markRead(@CurrentUser('accountId') accountId: string, @Param('id') id: string) {
    return this.service.markRead(accountId, id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc' })
  markAll(@CurrentUser('accountId') accountId: string, @Query('buildingId') buildingId?: string) {
    return this.service.markAllRead(accountId, buildingId);
  }
}
