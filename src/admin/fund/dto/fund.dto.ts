import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaintenanceJobStatus } from '@prisma/client';
import { ToUpper } from '../../../common/decorators/to-upper';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryJobsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: MaintenanceJobStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(MaintenanceJobStatus))
  status?: MaintenanceJobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: MaintenanceJobStatus })
  @ToUpper()
  @IsIn(Object.values(MaintenanceJobStatus))
  status!: MaintenanceJobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Chi phí thực tế (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Dự toán (VND)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledPeriod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: MaintenanceJobStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(MaintenanceJobStatus))
  status?: MaintenanceJobStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledPeriod?: string;
}
