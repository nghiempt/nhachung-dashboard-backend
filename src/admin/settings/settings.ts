import {
  Body,
  Controller,
  Get,
  Injectable,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';

export class UpdateBuildingSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(buildingId: string) {
    const b = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });
    if (!b) throw new NotFoundException('Không tìm thấy tòa nhà');
    return b;
  }

  async update(buildingId: string, dto: UpdateBuildingSettingsDto) {
    await this.get(buildingId);
    return this.prisma.building.update({
      where: { id: buildingId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.thumbnailUrl !== undefined
          ? { thumbnailUrl: dto.thumbnailUrl }
          : {}),
      },
    });
  }
}

@ApiTags('admin/settings')
@ApiBearerAuth()
@Roles()
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly service: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Cấu hình tòa nhà' })
  get(@AdminBuilding() buildingId: string) {
    return this.service.get(buildingId);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật cấu hình tòa nhà' })
  update(
    @AdminBuilding() buildingId: string,
    @Body() dto: UpdateBuildingSettingsDto,
  ) {
    return this.service.update(buildingId, dto);
  }
}
