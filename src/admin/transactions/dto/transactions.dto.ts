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
import { TransactionType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ToUpper } from '../../../common/decorators/to-upper';

export class QueryTransactionsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(TransactionType))
  type?: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType })
  @ToUpper()
  @IsIn(Object.values(TransactionType))
  type!: TransactionType;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
