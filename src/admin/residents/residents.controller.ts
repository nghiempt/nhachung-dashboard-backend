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
import { AdminResidentsService } from './residents.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import {
  CreateResidentDto,
  QueryResidentsDto,
  SetRoleDto,
  UpdateResidentDto,
} from './dto/residents.dto';

@ApiTags('admin/residents')
@ApiBearerAuth()
@Roles()
@Controller('admin/residents')
export class AdminResidentsController {
  constructor(private readonly service: AdminResidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách cư dân (search/filter/paginate)' })
  list(@AdminBuilding() buildingId: string, @Query() query: QueryResidentsDto) {
    return this.service.list(buildingId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê cư dân (cards)' })
  stats(@AdminBuilding() buildingId: string) {
    return this.service.stats(buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết cư dân' })
  detail(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.detail(buildingId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm cư dân' })
  create(@AdminBuilding() buildingId: string, @Body() dto: CreateResidentDto) {
    return this.service.create(buildingId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật cư dân' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateResidentDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Đổi vai trò cư dân' })
  setRole(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: SetRoleDto,
  ) {
    return this.service.setRole(buildingId, id, dto.role);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Duyệt xác minh cư dân' })
  verify(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.verify(buildingId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa cư dân khỏi tòa nhà' })
  remove(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.remove(buildingId, id);
  }
}
