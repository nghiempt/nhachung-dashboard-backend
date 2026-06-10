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
import { AdminApartmentsService } from './apartments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import {
  CreateApartmentDto,
  QueryApartmentsDto,
  UpdateApartmentDto,
} from './dto/apartments.dto';

@ApiTags('admin/apartments')
@ApiBearerAuth()
@Roles()
@Controller('admin/apartments')
export class AdminApartmentsController {
  constructor(private readonly service: AdminApartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách căn hộ' })
  list(@AdminBuilding() buildingId: string, @Query() query: QueryApartmentsDto) {
    return this.service.list(buildingId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê căn hộ' })
  stats(@AdminBuilding() buildingId: string) {
    return this.service.stats(buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết căn hộ' })
  detail(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.detail(buildingId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm căn hộ' })
  create(@AdminBuilding() buildingId: string, @Body() dto: CreateApartmentDto) {
    return this.service.create(buildingId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật căn hộ' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApartmentDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa căn hộ' })
  remove(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.remove(buildingId, id);
  }
}
