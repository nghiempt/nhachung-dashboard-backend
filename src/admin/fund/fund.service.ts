import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto, QueryJobsDto, UpdateJobDto } from './dto/fund.dto';

@Injectable()
export class AdminFundService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(buildingId: string) {
    const fund = await this.prisma.maintenanceFund.findUnique({
      where: { buildingId },
    });
    return fund ?? null;
  }

  async listJobs(buildingId: string, query: QueryJobsDto) {
    const where: Prisma.MaintenanceJobWhereInput = { buildingId };
    if (query.status) where.status = query.status;
    const rows = await this.prisma.maintenanceJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((j) => ({
      id: j.id,
      name: j.name,
      category: j.category,
      contractor: j.contractor,
      status: j.status.toLowerCase(),
      amount: j.amount,
      estimatedCost: j.estimatedCost,
      scheduledPeriod: j.scheduledPeriod,
      scheduledAt: j.scheduledAt,
      actualDate: j.actualDate,
      fundFinanced: j.fundFinanced,
    }));
  }

  async createJob(buildingId: string, dto: CreateJobDto) {
    return this.prisma.maintenanceJob.create({
      data: {
        buildingId,
        name: dto.name,
        status: dto.status,
        contractor: dto.contractor,
        category: dto.category,
        amount: dto.amount ?? null,
        estimatedCost: dto.estimatedCost ?? null,
        scheduledPeriod: dto.scheduledPeriod,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
    });
  }

  private async ensureJob(buildingId: string, id: string) {
    const j = await this.prisma.maintenanceJob.findFirst({
      where: { id, buildingId },
    });
    if (!j) throw new NotFoundException('Không tìm thấy hạng mục');
    return j;
  }

  async updateJob(buildingId: string, id: string, dto: UpdateJobDto) {
    await this.ensureJob(buildingId, id);
    return this.prisma.maintenanceJob.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.contractor !== undefined ? { contractor: dto.contractor } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.estimatedCost !== undefined
          ? { estimatedCost: dto.estimatedCost }
          : {}),
        ...(dto.scheduledPeriod !== undefined
          ? { scheduledPeriod: dto.scheduledPeriod }
          : {}),
      },
    });
  }

  async removeJob(buildingId: string, id: string) {
    await this.ensureJob(buildingId, id);
    await this.prisma.maintenanceJob.delete({ where: { id } });
    return { success: true };
  }
}
