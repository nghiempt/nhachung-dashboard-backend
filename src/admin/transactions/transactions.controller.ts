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
import { AdminTransactionsService } from './transactions.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import {
  CreateTransactionDto,
  QueryTransactionsDto,
  UpdateTransactionDto,
} from './dto/transactions.dto';

@ApiTags('admin/transactions')
@ApiBearerAuth()
@Roles()
@Controller('admin/transactions')
export class AdminTransactionsController {
  constructor(private readonly service: AdminTransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thu chi' })
  list(
    @AdminBuilding() buildingId: string,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.service.list(buildingId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Tổng thu / chi / số dư' })
  stats(@AdminBuilding() buildingId: string) {
    return this.service.stats(buildingId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch thu/chi' })
  create(
    @AdminBuilding() buildingId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.service.create(buildingId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật giao dịch' })
  update(
    @AdminBuilding() buildingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.service.update(buildingId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giao dịch' })
  remove(@AdminBuilding() buildingId: string, @Param('id') id: string) {
    return this.service.remove(buildingId, id);
  }
}
