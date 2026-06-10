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
import { AdminFeesService } from './fees.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import {
  CreateFeeDto,
  IssueAllDto,
  QueryFeesDto,
  UpdateFeeDto,
} from './dto/fees.dto';

@ApiTags('admin/fees')
@ApiBearerAuth()
@Roles()
@Controller('admin/fees')
export class AdminFeesController {
  constructor(private readonly service: AdminFeesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách hóa đơn phí (filter/paginate)' })
  list(@AdminBuilding() buildingId: string, @Query() query: QueryFeesDto) {
    return this.service.list(buildingId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê thu phí theo kỳ' })
  stats(@AdminBuilding() buildingId: string, @Query('period') period?: string) {
    return this.service.stats(buildingId, period);
  }

  @Post()
  @ApiOperation({ summary: 'Lập 1 hóa đơn phí' })
  create(@AdminBuilding() buildingId: string, @Body() dto: CreateFeeDto) {
    return this.service.create(buildingId, dto);
  }

  @Post('issue-all')
  @ApiOperation({ summary: 'Lập hóa đơn hàng loạt cho toàn bộ căn hộ' })
  issueAll(@AdminBuilding() buildingId: string, @Body() dto: IssueAllDto) {
    return this.service.issueAll(buildingId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết hóa đơn' })
  detail(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.detail(buildingId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật hóa đơn' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFeeDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Đánh dấu đã thu' })
  markPaid(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.markPaid(buildingId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hóa đơn' })
  remove(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.remove(buildingId, id);
  }
}
