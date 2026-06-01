import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { QueryEventsDto } from './dto/query-events.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sự kiện (month/upcoming)' })
  list(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.service.list(accountId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết sự kiện' })
  detail(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.detail(accountId, id);
  }
}
