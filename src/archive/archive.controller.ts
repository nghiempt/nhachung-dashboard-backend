import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ArchiveService } from './archive.service';
import { QueryArchiveDto } from './dto/query-archive.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('archive')
@ApiBearerAuth()
@Controller('archive')
export class ArchiveController {
  constructor(private readonly service: ArchiveService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê tổng quan kho lưu trữ' })
  stats(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.stats(accountId, buildingId);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tài liệu lưu trữ (gom theo năm / tháng)' })
  list(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryArchiveDto,
  ) {
    return this.service.list(accountId, query);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Đếm tài liệu theo danh mục lưu trữ' })
  byCategory(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.byCategory(accountId, buildingId);
  }

  @Get('top-downloads')
  @ApiOperation({ summary: 'Top 5 tài liệu tải nhiều nhất' })
  topDownloads(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.topDownloads(accountId, buildingId);
  }

  @Get('file-types')
  @ApiOperation({ summary: 'Phân bổ tài liệu theo định dạng' })
  fileTypes(
    @CurrentUser('accountId') accountId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.fileTypes(accountId, buildingId);
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Tăng lượt tải + trả về URL tài liệu' })
  download(
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
  ) {
    return this.service.download(accountId, id);
  }
}
