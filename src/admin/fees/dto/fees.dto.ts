import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  IsDateString,
  Min,
} from 'class-validator';
import { PaymentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ToUpper } from '../../../common/decorators/to-upper';

export class QueryFeesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Kỳ phí "2026-05"' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(PaymentStatus))
  status?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class CreateFeeDto {
  @ApiProperty({ description: 'Mã căn hộ, vd A-12.05' })
  @IsString()
  apartmentCode!: string;

  @ApiProperty({ description: 'Kỳ phí "2026-05"' })
  @IsString()
  period!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class IssueAllDto {
  @ApiProperty({ description: 'Kỳ phí "2026-05"' })
  @IsString()
  period!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateFeeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(PaymentStatus))
  status?: PaymentStatus;
}
