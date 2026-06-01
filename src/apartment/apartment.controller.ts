import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApartmentService } from './apartment.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('apartment')
@ApiBearerAuth()
@Controller('apartment')
export class ApartmentController {
  constructor(private readonly service: ApartmentService) {}

  @Get('me')
  @ApiOperation({ summary: 'Căn hộ của tôi (chi tiết + hợp đồng)' })
  me(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.me(accountId, buildingId);
  }

  @Get('fees')
  @ApiOperation({ summary: 'Phí quản lý căn hộ (lọc theo kỳ)' })
  fees(
    @CurrentUser('accountId') accountId: string,
    @Query('period') period?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.fees(accountId, period, buildingId);
  }
}
