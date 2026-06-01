import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('community')
@ApiBearerAuth()
@Controller('community-posts')
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @Get()
  @ApiOperation({ summary: 'Hoạt động cộng đồng (mới nhất)' })
  @ApiQuery({ name: 'buildingId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  list(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit?: number,
  ) {
    return this.service.list(accountId, buildingId, limit);
  }
}
