import { ApiPropertyOptional } from '@nestjs/swagger';
import { Theme } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ToUpper } from '../../common/decorators/to-upper';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: Theme })
  @IsOptional()
  @ToUpper()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}
