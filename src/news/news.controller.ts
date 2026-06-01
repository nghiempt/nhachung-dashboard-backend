import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { QueryNewsDto } from './dto/query-news.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('news')
@ApiBearerAuth()
@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách tin tức (category/pinned/search/paginate)' })
  list(@CurrentUser('accountId') accountId: string, @Query() query: QueryNewsDto) {
    return this.service.list(accountId, query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Tin nổi bật (tin ghim mới nhất hoặc mới nhất)' })
  featured(@CurrentUser('accountId') accountId: string, @Query('buildingId') buildingId?: string) {
    return this.service.featured(accountId, buildingId);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Top 5 tin xem nhiều nhất' })
  trending(@CurrentUser('accountId') accountId: string, @Query('buildingId') buildingId?: string) {
    return this.service.trending(accountId, buildingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tin tức (tăng view)' })
  detail(@CurrentUser('accountId') accountId: string, @Param('id') id: string) {
    return this.service.detail(accountId, id);
  }
}
