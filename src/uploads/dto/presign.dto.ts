import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PresignDto {
  @ApiProperty({ example: 'avatar.png' })
  @IsString()
  filename: string;

  @ApiPropertyOptional({ example: 'image/png' })
  @IsOptional()
  @IsString()
  contentType?: string;

  @ApiPropertyOptional({
    example: 'avatars',
    description: 'Logical folder (avatars, documents, feedback, notifications, id-cards)',
  })
  @IsOptional()
  @IsString()
  folder?: string;
}
