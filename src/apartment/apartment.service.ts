import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';

@Injectable()
export class ApartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  async me(accountId: string, buildingId?: string) {
    const { membership } = await this.ctx.resolveMembership(
      accountId,
      buildingId,
    );
    if (!membership?.apartmentId) {
      throw new NotFoundException('Bạn chưa được gán căn hộ');
    }

    const apartment = await this.prisma.apartment.findUnique({
      where: { id: membership.apartmentId },
      include: { building: true, contract: true },
    });
    if (!apartment) {
      throw new NotFoundException('Không tìm thấy căn hộ');
    }

    return {
      id: apartment.id,
      code: apartment.code,
      block: apartment.block,
      floor: apartment.floor,
      totalFloors: apartment.totalFloors,
      areaSqm: apartment.areaSqm,
      totalAreaSqm: apartment.totalAreaSqm,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      balconies: apartment.balconies,
      orientation: apartment.orientation,
      furnishingStatus: apartment.furnishingStatus,
      ownershipType: apartment.ownershipType,
      parkingLocations: apartment.parkingLocations,
      status: apartment.status,
      moveInDate: apartment.moveInDate,
      buildingName: apartment.building.name,
      isOwner: membership.isOwner,
      contract: apartment.contract
        ? {
            id: apartment.contract.id,
            contractNumber: apartment.contract.contractNumber,
            ownershipType: apartment.contract.ownershipType,
            contractDate: apartment.contract.contractDate,
            handoverDate: apartment.contract.handoverDate,
            ownerName: apartment.contract.ownerName,
            registrationStatus: apartment.contract.registrationStatus,
            documentUrl: apartment.contract.documentUrl,
          }
        : null,
    };
  }

  async fees(accountId: string, period?: string, buildingId?: string) {
    const { membership } = await this.ctx.resolveMembership(
      accountId,
      buildingId,
    );
    if (!membership?.apartmentId) {
      throw new NotFoundException('Bạn chưa được gán căn hộ');
    }

    const where: Prisma.ApartmentFeeWhereInput = {
      apartmentId: membership.apartmentId,
    };
    if (period) where.period = period;

    const fees = await this.prisma.apartmentFee.findMany({
      where,
      orderBy: [{ period: 'desc' }, { name: 'asc' }],
    });

    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const unpaidCount = fees.filter((f) => f.status !== 'PAID').length;

    return {
      period: period ?? null,
      items: fees.map((f) => ({
        id: f.id,
        name: f.name,
        amount: f.amount,
        status: f.status.toLowerCase(),
        dueDate: f.dueDate,
        paidAt: f.paidAt,
      })),
      totalAmount,
      unpaidCount,
    };
  }
}
