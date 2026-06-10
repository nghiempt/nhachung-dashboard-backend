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
import { AdminOperationsService } from './operations.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import {
  CreateSystemDto,
  CreateWorkOrderDto,
  QueryWorkOrdersDto,
  UpdateSystemDto,
  UpdateWorkOrderDto,
} from './dto/operations.dto';

@ApiTags('admin/operations')
@ApiBearerAuth()
@Roles()
@Controller('admin/operations')
export class AdminOperationsController {
  constructor(private readonly service: AdminOperationsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Thống kê vận hành' })
  overview(@AdminBuilding() buildingId: string) {
    return this.service.overview(buildingId);
  }

  @Get('work-orders')
  @ApiOperation({ summary: 'Danh sách yêu cầu xử lý' })
  listWorkOrders(
    @AdminBuilding() buildingId: string,
    @Query() query: QueryWorkOrdersDto,
  ) {
    return this.service.listWorkOrders(buildingId, query);
  }

  @Post('work-orders')
  @ApiOperation({ summary: 'Tạo yêu cầu xử lý' })
  createWorkOrder(
    @AdminBuilding() buildingId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.service.createWorkOrder(buildingId, dto);
  }

  @Patch('work-orders/:id')
  @ApiOperation({ summary: 'Cập nhật yêu cầu xử lý' })
  updateWorkOrder(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.service.updateWorkOrder(buildingId, id, dto);
  }

  @Delete('work-orders/:id')
  @ApiOperation({ summary: 'Xóa yêu cầu xử lý' })
  removeWorkOrder(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.removeWorkOrder(buildingId, id);
  }

  @Get('systems')
  @ApiOperation({ summary: 'Danh sách hệ thống kỹ thuật' })
  listSystems(@AdminBuilding() buildingId: string) {
    return this.service.listSystems(buildingId);
  }

  @Post('systems')
  @ApiOperation({ summary: 'Thêm hệ thống' })
  createSystem(
    @AdminBuilding() buildingId: string,
    @Body() dto: CreateSystemDto,
  ) {
    return this.service.createSystem(buildingId, dto);
  }

  @Patch('systems/:id')
  @ApiOperation({ summary: 'Cập nhật hệ thống' })
  updateSystem(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSystemDto,
  ) {
    return this.service.updateSystem(buildingId, id, dto);
  }

  @Delete('systems/:id')
  @ApiOperation({ summary: 'Xóa hệ thống' })
  removeSystem(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.removeSystem(buildingId, id);
  }
}
