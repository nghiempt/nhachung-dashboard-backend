import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
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
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number,
    @Query('buildingId') buildingId?: string,
  ) {
    // Clamp to a sane window so a caller can't request thousands of periods.
    const n = Math.min(Math.max(months, 1), 24);
    return this.service.periods(accountId, n, buildingId);
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
