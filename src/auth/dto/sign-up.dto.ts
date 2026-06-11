import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'chris.tran@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Default@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt only hashes the first 72 bytes
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/, {
    message:
      'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
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
