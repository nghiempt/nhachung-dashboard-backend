import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'chris.tran@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Default@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Trần Hoàng Chris' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 'Spa Mai Anh' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'TRUONG2026' })
  @IsOptional()
  @IsString()
  referralCode?: string;

  @ApiPropertyOptional({ description: 'Terms acceptance', default: true })
  @IsOptional()
  @IsBoolean()
  agree?: boolean;
}
