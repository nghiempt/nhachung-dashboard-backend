import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { ArchiveCategory, DocumentFileType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ToUpper } from '../../../common/decorators/to-upper';

export class QueryDocumentsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ArchiveCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ArchiveCategory))
  archiveCategory?: ArchiveCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ description: 'URL file đã upload (qua /uploads)' })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ enum: DocumentFileType, default: 'PDF' })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(DocumentFileType))
  fileType?: DocumentFileType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ArchiveCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ArchiveCategory))
  archiveCategory?: ArchiveCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeBytes?: number;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ArchiveCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(ArchiveCategory))
  archiveCategory?: ArchiveCategory;
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iconUrl?: string;
}
