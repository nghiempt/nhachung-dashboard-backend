import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryTransactionsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Lọc theo loại giao dịch',
    enum: ['income', 'expense'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['income', 'expense', 'INCOME', 'EXPENSE'])
  type?: string;

  @ApiPropertyOptional({ description: 'Kỳ "YYYY-MM" để lọc theo tháng' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: 'ID tòa nhà (mặc định: tòa đang chọn)' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
