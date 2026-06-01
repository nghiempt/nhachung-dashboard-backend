import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class NotificationToggleDto {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean;
}
