import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  CreateTransactionDto,
  QueryTransactionsDto,
  UpdateTransactionDto,
} from './dto/transactions.dto';

@Injectable()
export class AdminTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(buildingId: string, query: QueryTransactionsDto) {
    const where: Prisma.TransactionWhereInput = { buildingId };
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const items = rows.map((t) => ({
      id: t.id,
      code: t.code,
      type: t.type.toLowerCase(),
      category: t.category,
      description: t.description,
      subInfo: t.subInfo,
      vendorName: t.vendorName,
      paymentMethod: t.paymentMethod,
      amount: t.amount,
      occurredAt: t.occurredAt,
    }));
    return paginate(items, total, query.page, query.limit);
  }

  async stats(buildingId: string) {
    const grouped = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { buildingId },
      _sum: { amount: true },
    });
    let income = 0;
    let expense = 0;
    for (const g of grouped) {
      if (g.type === TransactionType.INCOME) income = Number(g._sum.amount ?? 0);
      else expense = Number(g._sum.amount ?? 0);
    }
    return { income, expense, balance: income - expense };
  }

  async create(buildingId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        buildingId,
        code: `GD-${nanoid(8).toUpperCase()}`,
        type: dto.type,
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        vendorName: dto.vendorName,
        paymentMethod: dto.paymentMethod,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      },
    });
  }

  private async ensure(buildingId: string, id: string) {
    const t = await this.prisma.transaction.findFirst({
      where: { id, buildingId },
    });
    if (!t) throw new NotFoundException('Không tìm thấy giao dịch');
    return t;
  }

  async update(buildingId: string, id: string, dto: UpdateTransactionDto) {
    await this.ensure(buildingId, id);
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.vendorName !== undefined ? { vendorName: dto.vendorName } : {}),
        ...(dto.paymentMethod !== undefined
          ? { paymentMethod: dto.paymentMethod }
          : {}),
      },
    });
  }

  async remove(buildingId: string, id: string) {
    await this.ensure(buildingId, id);
    await this.prisma.transaction.delete({ where: { id } });
    return { success: true };
  }
}
