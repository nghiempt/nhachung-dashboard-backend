import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { QueryReportsDto } from './dto/query-reports.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Thẻ tổng quan báo cáo theo năm' })
  summary(
    @CurrentUser('accountId') accountId: string,
    @Query('year') year?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.summary(accountId, year ? Number(year) : undefined, buildingId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách báo cáo theo tab (loại kỳ/năm)' })
  list(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryReportsDto,
  ) {
    return this.service.list(accountId, query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Báo cáo sắp đến hạn (nháp/chờ duyệt)' })
  upcoming(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.upcoming(accountId, buildingId);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Tăng lượt xem báo cáo' })
  view(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.incrementView(accountId, id);
  }
}
