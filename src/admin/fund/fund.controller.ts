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
import { AdminFundService } from './fund.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import { CreateJobDto, QueryJobsDto, UpdateJobDto } from './dto/fund.dto';

@ApiTags('admin/fund')
@ApiBearerAuth()
@Roles()
@Controller('admin/fund')
export class AdminFundController {
  constructor(private readonly service: AdminFundService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan quỹ bảo trì' })
  overview(@AdminBuilding() buildingId: string) {
    return this.service.overview(buildingId);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Danh sách hạng mục bảo trì' })
  listJobs(@AdminBuilding() buildingId: string, @Query() query: QueryJobsDto) {
    return this.service.listJobs(buildingId, query);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Tạo hạng mục bảo trì' })
  createJob(@AdminBuilding() buildingId: string, @Body() dto: CreateJobDto) {
    return this.service.createJob(buildingId, dto);
  }

  @Patch('jobs/:id')
  @ApiOperation({ summary: 'Cập nhật hạng mục' })
  updateJob(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.service.updateJob(buildingId, id, dto);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Xóa hạng mục' })
  removeJob(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.removeJob(buildingId, id);
  }
}
