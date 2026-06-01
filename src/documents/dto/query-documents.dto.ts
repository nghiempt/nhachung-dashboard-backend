import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentFileType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ToUpper } from '../../common/decorators/to-upper';

export class QueryDocumentsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Lọc theo danh mục tài liệu' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: DocumentFileType })
  @IsOptional()
  @ToUpper()
  @IsEnum(DocumentFileType)
  fileType?: DocumentFileType;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
