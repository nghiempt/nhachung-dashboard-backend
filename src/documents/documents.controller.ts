import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Danh mục tài liệu + số lượng tài liệu mỗi danh mục' })
  categories(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.categories(accountId, buildingId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tài liệu (category/fileType/search/paginate)' })
  list(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryDocumentsDto,
  ) {
    return this.service.list(accountId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết tài liệu (tăng view)' })
  detail(@CurrentUser('accountId') accountId: string, @Param('id') id: string) {
    return this.service.detail(accountId, id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Tăng lượt xem tài liệu' })
  incrementView(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.incrementView(accountId, id);
  }
}
