import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'chris.tran@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Default@123' })
  @IsString()
  password: string;
}
