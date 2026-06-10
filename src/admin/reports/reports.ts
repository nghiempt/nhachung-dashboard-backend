import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsDateString } from 'class-validator';
import {
  ArchiveCategory,
  Prisma,
  ReportPeriodType,
  ReportStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import { ToUpper } from '../../common/decorators/to-upper';

export class QueryReportsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ReportStatus))
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportPeriodType })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ReportPeriodType))
  periodType?: ReportPeriodType;
}

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ enum: ReportPeriodType })
  @ToUpper()
  @IsIn(Object.values(ReportPeriodType))
  periodType!: ReportPeriodType;

  @ApiProperty()
  @IsString()
  periodLabel!: string;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ReportStatus))
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ArchiveCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ArchiveCategory))
  category?: ArchiveCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;
}

export class UpdateReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ReportStatus))
  status?: ReportStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;
}

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(buildingId: string, query: QueryReportsDto) {
    const where: Prisma.ReportWhereInput = { buildingId };
    if (query.status) where.status = query.status;
    if (query.periodType) where.periodType = query.periodType;
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.report.count({ where }),
    ]);
    const items = rows.map((r) => ({
      ...r,
      status: r.status.toLowerCase(),
      periodType: r.periodType.toLowerCase(),
      category: r.category?.toLowerCase() ?? null,
    }));
    return paginate(items, total, query.page, query.limit);
  }

  async create(buildingId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        buildingId,
        title: dto.title,
        periodType: dto.periodType,
        periodLabel: dto.periodLabel,
        status: dto.status ?? ReportStatus.DRAFT,
        category: dto.category,
        responsibleName: dto.responsibleName,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        url: dto.url,
        publishedAt: dto.status === ReportStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  private async ensure(buildingId: string, id: string) {
    const r = await this.prisma.report.findFirst({ where: { id, buildingId } });
    if (!r) throw new NotFoundException('Không tìm thấy báo cáo');
    return r;
  }

  async update(buildingId: string, id: string, dto: UpdateReportDto) {
    await this.ensure(buildingId, id);
    return this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.responsibleName !== undefined
          ? { responsibleName: dto.responsibleName }
          : {}),
        ...(dto.url !== undefined ? { url: dto.url } : {}),
        ...(dto.status !== undefined
          ? {
              status: dto.status,
              publishedAt:
                dto.status === ReportStatus.PUBLISHED ? new Date() : null,
            }
          : {}),
      },
    });
  }

  async remove(buildingId: string, id: string) {
    await this.ensure(buildingId, id);
    await this.prisma.report.delete({ where: { id } });
    return { success: true };
  }
}

@ApiTags('admin/reports')
@ApiBearerAuth()
@Roles()
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly service: AdminReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách báo cáo định kỳ' })
  list(@AdminBuilding() buildingId: string, @Query() query: QueryReportsDto) {
    return this.service.list(buildingId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo báo cáo' })
  create(@AdminBuilding() buildingId: string, @Body() dto: CreateReportDto) {
    return this.service.create(buildingId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật / phát hành báo cáo' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa báo cáo' })
  remove(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.remove(buildingId, id);
  }
}
