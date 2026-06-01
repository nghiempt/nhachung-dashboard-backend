import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ReportPeriodType } from '@prisma/client';
import { ToUpper } from '../../common/decorators/to-upper';

export class QueryReportsDto {
  @ApiPropertyOptional({
    enum: ReportPeriodType,
    description: 'Lọc theo loại kỳ báo cáo (month/quarter/year)',
  })
  @IsOptional()
  @ToUpper()
  @IsEnum(ReportPeriodType)
  periodType?: ReportPeriodType;

  @ApiPropertyOptional({ description: 'Lọc theo năm (publishedAt/dueDate)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
