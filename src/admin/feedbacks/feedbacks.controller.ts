import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminFeedbacksService } from './feedbacks.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  QueryAdminFeedbacksDto,
  ReplyFeedbackDto,
  UpdateFeedbackDto,
} from './dto/feedbacks.dto';

@ApiTags('admin/feedbacks')
@ApiBearerAuth()
@Roles()
@Controller('admin/feedbacks')
export class AdminFeedbacksController {
  constructor(private readonly service: AdminFeedbacksService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Đếm phản ánh theo trạng thái' })
  summary(@AdminBuilding() buildingId: string) {
    return this.service.summary(buildingId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách phản ánh (admin)' })
  list(
    @AdminBuilding() buildingId: string,
    @Query() query: QueryAdminFeedbacksDto,
  ) {
    return this.service.list(buildingId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phản ánh' })
  detail(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.detail(buildingId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật trạng thái / mức ưu tiên' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Phản hồi / thêm bước xử lý' })
  reply(
    @AdminBuilding() buildingId: string,
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
    @Body() dto: ReplyFeedbackDto,
  ) {
    return this.service.reply(buildingId, id, accountId, dto);
  }
}
