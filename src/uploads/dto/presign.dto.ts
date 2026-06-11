import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ALLOWED_UPLOAD_FOLDERS } from '../upload-folders';

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
    description: `Logical folder. One of: ${ALLOWED_UPLOAD_FOLDERS.join(', ')}`,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_UPLOAD_FOLDERS as unknown as string[])
  folder?: string;
}
