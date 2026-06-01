import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeedbacksService } from './feedbacks.service';
import { QueryFeedbacksDto } from './dto/query-feedbacks.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('feedbacks')
@ApiBearerAuth()
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly service: FeedbacksService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Đếm phản ánh theo trạng thái (tabs)' })
  summary(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.summary(accountId, buildingId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách phản ánh (status/search/paginate)' })
  list(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryFeedbacksDto,
  ) {
    return this.service.list(accountId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phản ánh (ảnh + lịch sử xử lý)' })
  detail(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.detail(accountId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo phản ánh mới' })
  create(
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.service.create(accountId, dto);
  }
}
