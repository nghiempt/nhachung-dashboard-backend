import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryWorkOrdersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái (lowercase): processing | completed | overdue',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Tòa nhà (mặc định: tòa nhà đang chọn)' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
