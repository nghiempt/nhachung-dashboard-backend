import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OperationsService } from './operations.service';
import { QueryWorkOrdersDto } from './dto/query-work-orders.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('operations')
@ApiBearerAuth()
@Controller('operations')
export class OperationsController {
  constructor(private readonly service: OperationsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Thống kê yêu cầu theo trạng thái + phân bố danh mục' })
  overview(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.overview(accountId, buildingId);
  }

  @Get('work-orders')
  @ApiOperation({ summary: 'Danh sách yêu cầu (lọc trạng thái + phân trang)' })
  workOrders(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryWorkOrdersDto,
  ) {
    return this.service.workOrders(accountId, query);
  }

  @Get('systems')
  @ApiOperation({ summary: 'Tình trạng hệ thống tòa nhà' })
  systems(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.systems(accountId, buildingId);
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Lịch bảo trì trong tuần' })
  schedule(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.schedule(accountId, buildingId);
  }
}
