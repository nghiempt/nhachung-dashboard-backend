import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('buildings')
@ApiBearerAuth()
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly service: BuildingsService) {}

  @Get()
  @ApiOperation({ summary: 'Tòa của tôi + khám phá + tòa đang active' })
  list(@CurrentUser('accountId') accountId: string) {
    return this.service.list(accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tòa nhà' })
  detail(@CurrentUser('accountId') accountId: string, @Param('id') id: string) {
    return this.service.detail(accountId, id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Chọn tòa nhà đang active' })
  setActive(@CurrentUser('accountId') accountId: string, @Param('id') id: string) {
    return this.service.setActive(accountId, id);
  }
}
