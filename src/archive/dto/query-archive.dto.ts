import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ArchiveCategory, DocumentFileType } from '@prisma/client';
import { ToUpper } from '../../common/decorators/to-upper';

export class QueryArchiveDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên tài liệu' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ArchiveCategory })
  @IsOptional()
  @ToUpper()
  @IsEnum(ArchiveCategory)
  category?: ArchiveCategory;

  @ApiPropertyOptional({ enum: DocumentFileType })
  @IsOptional()
  @ToUpper()
  @IsEnum(DocumentFileType)
  fileType?: DocumentFileType;

  @ApiPropertyOptional({ description: 'Lọc theo năm (createdAt)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
