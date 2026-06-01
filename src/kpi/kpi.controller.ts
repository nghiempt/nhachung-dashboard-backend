import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KpiService } from './kpi.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('kpi')
@ApiBearerAuth()
@Controller('kpi')
export class KpiController {
  constructor(private readonly service: KpiService) {}

  @Get()
  @ApiOperation({ summary: 'KPI BQT theo kỳ (mặc định kỳ mới nhất) + danh mục & chỉ số' })
  overview(
    @CurrentUser('accountId') accountId: string,
    @Query('period') period?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.overview(accountId, period, buildingId);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Xu hướng KPI 6 quý (period asc)' })
  trend(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.trend(accountId, buildingId);
  }

  @Get('members')
  @ApiOperation({ summary: 'Thành viên Ban quản trị (sortOrder asc)' })
  members(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.members(accountId, buildingId);
  }
}
