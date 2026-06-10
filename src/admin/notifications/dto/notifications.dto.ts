import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationCategory, NotificationIconType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ToUpper } from '../../../common/decorators/to-upper';

export class QueryNotificationsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: NotificationCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(NotificationCategory))
  category?: NotificationCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  urgent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Các đoạn nội dung', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  body?: string[];

  @ApiPropertyOptional({ enum: NotificationCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(NotificationCategory))
  category?: NotificationCategory;

  @ApiPropertyOptional({ enum: NotificationIconType })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(NotificationIconType))
  iconType?: NotificationIconType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eyebrow?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorRole?: string;
}

export class UpdateNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  body?: string[];

  @ApiPropertyOptional({ enum: NotificationCategory })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(NotificationCategory))
  category?: NotificationCategory;

  @ApiPropertyOptional({ enum: NotificationIconType })
  @IsOptional()
  @ToUpper()
  @IsIn(Object.values(NotificationIconType))
  iconType?: NotificationIconType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eyebrow?: string;
}
