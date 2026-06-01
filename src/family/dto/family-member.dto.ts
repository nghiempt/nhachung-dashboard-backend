import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender, IdType, VehicleType } from '@prisma/client';
import { ToUpper } from '../../common/decorators/to-upper';

export class FamilyMemberDocumentDto {
  @ApiProperty({ enum: IdType })
  @ToUpper()
  @IsEnum(IdType)
  type!: IdType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class FamilyMemberVehicleDto {
  @ApiProperty()
  @IsString()
  licensePlate!: string;

  @ApiProperty({ enum: VehicleType })
  @ToUpper()
  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parkingLocation?: string;
}

export class FamilyMemberDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Chủ hộ, Vợ, Con trai...' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @ToUpper()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Qua phụ huynh...' })
  @IsOptional()
  @IsString()
  contactType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [FamilyMemberDocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberDocumentDto)
  documents?: FamilyMemberDocumentDto[];

  @ApiPropertyOptional({ type: [FamilyMemberVehicleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberVehicleDto)
  vehicles?: FamilyMemberVehicleDto[];

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}
