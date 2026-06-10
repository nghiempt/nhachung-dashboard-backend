import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  SystemStatus,
  WorkOrderCategory,
  WorkOrderPriority,
  WorkOrderStatus,
} from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ToUpper } from '../../../common/decorators/to-upper';

export class QueryWorkOrdersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: WorkOrderStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(WorkOrderStatus))
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ enum: WorkOrderCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(WorkOrderCategory))
  category?: WorkOrderCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class CreateWorkOrderDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: WorkOrderCategory })
  @ToUpper()
  @IsIn(Object.values(WorkOrderCategory))
  category!: WorkOrderCategory;

  @ApiPropertyOptional({ enum: WorkOrderPriority })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(WorkOrderPriority))
  priority?: WorkOrderPriority;

  @ApiPropertyOptional({ enum: WorkOrderStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(WorkOrderStatus))
  status?: WorkOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requesterName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

export class UpdateWorkOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: WorkOrderCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(WorkOrderCategory))
  category?: WorkOrderCategory;

  @ApiPropertyOptional({ enum: WorkOrderPriority })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(WorkOrderPriority))
  priority?: WorkOrderPriority;

  @ApiPropertyOptional({ enum: WorkOrderStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(WorkOrderStatus))
  status?: WorkOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  requesterName?: string;
}

export class CreateSystemDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional({ enum: SystemStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(SystemStatus))
  status?: SystemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metric?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateSystemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detail?: string;

  @ApiPropertyOptional({ enum: SystemStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(SystemStatus))
  status?: SystemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metric?: string;
}
