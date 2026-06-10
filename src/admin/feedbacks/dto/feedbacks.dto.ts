import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { FeedbackPriority, FeedbackStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ToUpper } from '../../../common/decorators/to-upper';

export class QueryAdminFeedbacksDto extends PaginationDto {
  @ApiPropertyOptional({ enum: FeedbackStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(FeedbackStatus))
  status?: FeedbackStatus;

  @ApiPropertyOptional({ enum: FeedbackPriority })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(FeedbackPriority))
  priority?: FeedbackPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ enum: FeedbackStatus })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(FeedbackStatus))
  status?: FeedbackStatus;

  @ApiPropertyOptional({ enum: FeedbackPriority })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(FeedbackPriority))
  priority?: FeedbackPriority;
}

export class ReplyFeedbackDto {
  @ApiProperty({ description: 'Tiêu đề bước xử lý' })
  @IsString()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: FeedbackStatus, description: 'Đổi trạng thái kèm phản hồi' })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(FeedbackStatus))
  status?: FeedbackStatus;
}
