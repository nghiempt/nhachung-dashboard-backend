import { Controller, Get, Injectable } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeedbackStatus, PaymentStatus, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(buildingId: string) {
    const [
      residents,
      apartments,
      openFeedbacks,
      openWorkOrders,
      unpaidFees,
      fund,
    ] = await this.prisma.$transaction([
      this.prisma.accountBuilding.count({ where: { buildingId } }),
      this.prisma.apartment.count({ where: { buildingId } }),
      this.prisma.feedback.count({
        where: { buildingId, status: FeedbackStatus.PROCESSING },
      }),
      this.prisma.workOrder.count({
        where: { buildingId, status: WorkOrderStatus.PROCESSING },
      }),
      this.prisma.apartmentFee.aggregate({
        where: {
          apartment: { buildingId },
          status: { in: [PaymentStatus.UNPAID, PaymentStatus.OVERDUE] },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.maintenanceFund.findUnique({ where: { buildingId } }),
    ]);

    return {
      residents,
      apartments,
      openFeedbacks,
      openWorkOrders,
      outstandingFees: unpaidFees._sum.amount ?? 0,
      unpaidUnits: unpaidFees._count._all,
      fundBalance: fund?.balance ?? 0,
    };
  }
}

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@Roles()
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Tổng quan quản trị tòa nhà' })
  overview(@AdminBuilding() buildingId: string) {
    return this.service.overview(buildingId);
  }
}
