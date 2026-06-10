import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ADMIN_ROLES } from '../../../common/decorators/roles.decorator';

const MEMBER_ROLES = ['resident', ...ADMIN_ROLES] as const;

export class QueryResidentsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Lọc trạng thái xác minh',
    enum: ['verified', 'pending'],
  })
  @IsOptional()
  @IsIn(['verified', 'pending'])
  status?: 'verified' | 'pending';

  @ApiPropertyOptional({ description: 'Lọc theo vai trò', enum: MEMBER_ROLES })
  @IsOptional()
  @IsIn(MEMBER_ROLES as unknown as string[])
  role?: string;

  @ApiPropertyOptional({ description: 'Override active building' })
  @IsOptional()
  @IsString()
  buildingId?: string;
}

export class CreateResidentDto {
  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Mã căn hộ (vd A-12.05) để gán' })
  @IsOptional()
  @IsString()
  apartmentCode?: string;

  @ApiPropertyOptional({ enum: MEMBER_ROLES, default: 'resident' })
  @IsOptional()
  @IsIn(MEMBER_ROLES as unknown as string[])
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;
}

export class UpdateResidentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Mã căn hộ để gán/đổi' })
  @IsOptional()
  @IsString()
  apartmentCode?: string;

  @ApiPropertyOptional({ enum: MEMBER_ROLES })
  @IsOptional()
  @IsIn(MEMBER_ROLES as unknown as string[])
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;
}

export class SetRoleDto {
  @IsIn(MEMBER_ROLES as unknown as string[])
  role!: string;
}
