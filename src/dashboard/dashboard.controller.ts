import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng hợp dữ liệu trang Dashboard' })
  overview(@CurrentUser('accountId') accountId: string, @Query('buildingId') buildingId?: string) {
    return this.service.overview(accountId, buildingId);
  }
}
