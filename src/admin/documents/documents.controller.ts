import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminDocumentsService } from './documents.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateCategoryDto,
  CreateDocumentDto,
  QueryDocumentsDto,
  UpdateDocumentDto,
} from './dto/documents.dto';

@ApiTags('admin/documents')
@ApiBearerAuth()
@Roles()
@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly service: AdminDocumentsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Danh mục tài liệu' })
  categories(@AdminBuilding() buildingId: string) {
    return this.service.categories(buildingId);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Tạo danh mục tài liệu' })
  createCategory(
    @AdminBuilding() buildingId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.createCategory(buildingId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tài liệu (admin)' })
  list(@AdminBuilding() buildingId: string, @Query() query: QueryDocumentsDto) {
    return this.service.list(buildingId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm tài liệu (sau khi upload file)' })
  create(
    @AdminBuilding() buildingId: string,
    @CurrentUser('accountId') accountId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.service.create(buildingId, accountId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tài liệu' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài liệu' })
  remove(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.remove(buildingId, id);
  }
}
