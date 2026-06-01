import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsCategory } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ToUpper } from '../../common/decorators/to-upper';

export class QueryNewsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: NewsCategory })
  @IsOptional()
  @ToUpper()
  @IsEnum(NewsCategory)
  category?: NewsCategory;

  @ApiPropertyOptional({ description: 'Chỉ lấy tin được ghim' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  pinned?: boolean;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
