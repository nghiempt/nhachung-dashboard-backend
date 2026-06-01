import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('financial')
@ApiBearerAuth()
@Controller('financial')
export class FinancialController {
  constructor(private readonly service: FinancialService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan tài chính (kỳ, line items, quỹ, báo cáo)' })
  overview(
    @CurrentUser('accountId') accountId: string,
    @Query('period') period?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.overview(accountId, period, buildingId);
  }

  @Get('periods')
  @ApiOperation({ summary: 'N kỳ gần nhất cho biểu đồ thu chi' })
  periods(
    @CurrentUser('accountId') accountId: string,
    @Query('months') months?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    const n = months ? parseInt(months, 10) : 6;
    return this.service.periods(accountId, Number.isFinite(n) ? n : 6, buildingId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Sổ giao dịch thu chi (lọc/tìm kiếm/phân trang)' })
  transactions(
    @CurrentUser('accountId') accountId: string,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.service.transactions(accountId, query);
  }
}
