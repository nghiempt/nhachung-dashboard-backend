import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ToUpper } from '../../common/decorators/to-upper';

export class VehicleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicleName?: string;

  @ApiProperty()
  @IsString()
  licensePlate: string;

  @ApiProperty({ enum: VehicleType })
  @ToUpper()
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parkingLocation?: string;
}

export class UpdateVehicleDto extends PartialType(VehicleDto) {}
