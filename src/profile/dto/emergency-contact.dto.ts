import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EmergencyContactDto {
  @ApiProperty()
  @IsString()
  contactName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;
}

export class UpdateEmergencyContactDto extends PartialType(EmergencyContactDto) {}
