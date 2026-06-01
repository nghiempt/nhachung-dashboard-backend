import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, IdType } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToUpper } from '../../common/decorators/to-upper';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @ToUpper()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  // ── Identification ──────────────────────────────────────────
  @ApiPropertyOptional({ enum: IdType })
  @IsOptional()
  @ToUpper()
  @IsEnum(IdType)
  idType?: IdType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  idIssueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idIssueLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idFrontUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idBackUrl?: string;

  // ── Contact ─────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zaloNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  zaloLinked?: boolean;
}
