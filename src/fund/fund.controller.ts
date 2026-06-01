import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FundService } from './fund.service';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('fund')
@ApiBearerAuth()
@Controller('fund')
export class FundController {
  constructor(private readonly service: FundService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan quỹ bảo trì (MaintenanceFund + unitsUnpaid)' })
  overview(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.overview(accountId, buildingId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Biến động số dư quỹ theo kỳ' })
  movements(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.movements(accountId, buildingId);
  }

  @Get('blocks')
  @ApiOperation({ summary: 'Tỉ lệ thu quỹ theo block (theo kỳ hoặc kỳ mới nhất)' })
  blocks(
    @CurrentUser('accountId') accountId: string,
    @Query('period') period?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.blocks(accountId, period, buildingId);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Danh sách hạng mục bảo trì (lọc theo trạng thái)' })
  jobs(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryJobsDto,
  ) {
    return this.service.jobs(accountId, query);
  }
}
