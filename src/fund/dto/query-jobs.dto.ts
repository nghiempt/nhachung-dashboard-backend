import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MaintenanceJobStatus } from '@prisma/client';
import { ToUpper } from '../../common/decorators/to-upper';

export class QueryJobsDto {
  @ApiPropertyOptional({
    enum: MaintenanceJobStatus,
    description: 'Lọc theo trạng thái (completed/in_progress/planned/tentative)',
  })
  @IsOptional()
  @ToUpper()
  @IsEnum(MaintenanceJobStatus)
  status?: MaintenanceJobStatus;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;

  @ApiPropertyOptional({ description: 'Kỳ thu (vd: "2024-05")' })
  @IsOptional()
  @IsString()
  period?: string;
}
