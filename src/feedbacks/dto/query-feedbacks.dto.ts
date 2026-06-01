import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FeedbackStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ToUpper } from '../../common/decorators/to-upper';

export class QueryFeedbacksDto extends PaginationDto {
  @ApiPropertyOptional({ enum: FeedbackStatus })
  @IsOptional()
  @ToUpper()
  @IsEnum(FeedbackStatus)
  status?: FeedbackStatus;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
