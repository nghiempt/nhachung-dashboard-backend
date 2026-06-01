import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationCategory } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ToUpper } from '../../common/decorators/to-upper';

export enum NotificationTab {
  ALL = 'all',
  URGENT = 'urgent',
  UNREAD = 'unread',
  READ = 'read',
}

export class QueryNotificationsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: NotificationTab, default: NotificationTab.ALL })
  @IsOptional()
  @IsEnum(NotificationTab)
  tab?: NotificationTab = NotificationTab.ALL;

  @ApiPropertyOptional({ enum: NotificationCategory })
  @IsOptional()
  @ToUpper()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
