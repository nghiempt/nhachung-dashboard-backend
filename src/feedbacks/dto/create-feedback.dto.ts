import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { FeedbackPriority } from '@prisma/client';
import { ToUpper } from '../../common/decorators/to-upper';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Tiêu đề phản ánh' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Danh mục phản ánh' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: FeedbackPriority, default: FeedbackPriority.MEDIUM })
  @IsOptional()
  @ToUpper()
  @IsEnum(FeedbackPriority)
  priority?: FeedbackPriority = FeedbackPriority.MEDIUM;

  @ApiPropertyOptional({ description: 'Vị trí liên quan' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách URL ảnh đã upload',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
