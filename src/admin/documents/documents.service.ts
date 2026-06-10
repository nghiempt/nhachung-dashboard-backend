import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import {
  CreateCategoryDto,
  CreateDocumentDto,
  QueryDocumentsDto,
  UpdateDocumentDto,
} from './dto/documents.dto';

@Injectable()
export class AdminDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async categories(buildingId: string) {
    const cats = await this.prisma.documentCategory.findMany({
      where: { buildingId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { documents: true } } },
    });
    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      iconUrl: c.iconUrl,
      documentCount: c._count.documents,
    }));
  }

  async createCategory(buildingId: string, dto: CreateCategoryDto) {
    const existing = await this.prisma.documentCategory.findFirst({
      where: { buildingId, name: dto.name },
    });
    if (existing) throw new BadRequestException('Danh mục đã tồn tại');
    return this.prisma.documentCategory.create({
      data: { buildingId, name: dto.name, iconUrl: dto.iconUrl },
    });
  }

  async list(buildingId: string, query: QueryDocumentsDto) {
    const where: Prisma.DocumentWhereInput = { buildingId };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.archiveCategory) where.archiveCategory = query.archiveCategory;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { category: { select: { name: true } } },
      }),
      this.prisma.document.count({ where }),
    ]);

    const items = rows.map((d) => ({
      id: d.id,
      name: d.name,
      fileType: d.fileType.toLowerCase(),
      sizeBytes: d.sizeBytes,
      url: d.url,
      categoryId: d.categoryId,
      categoryName: d.category?.name ?? null,
      archiveCategory: d.archiveCategory?.toLowerCase() ?? null,
      viewCount: d.viewCount,
      downloadCount: d.downloadCount,
      createdAt: d.createdAt,
    }));

    return paginate(items, total, query.page, query.limit);
  }

  async create(buildingId: string, accountId: string, dto: CreateDocumentDto) {
    if (dto.categoryId) {
      const cat = await this.prisma.documentCategory.findFirst({
        where: { id: dto.categoryId, buildingId },
      });
      if (!cat) throw new BadRequestException('Danh mục không hợp lệ');
    }
    const doc = await this.prisma.document.create({
      data: {
        buildingId,
        name: dto.name,
        url: dto.url,
        fileType: dto.fileType ?? 'PDF',
        categoryId: dto.categoryId,
        archiveCategory: dto.archiveCategory,
        sizeBytes: dto.sizeBytes,
        uploadedById: accountId,
      },
    });
    return doc;
  }

  private async ensure(buildingId: string, id: string) {
    const d = await this.prisma.document.findFirst({
      where: { id, buildingId },
    });
    if (!d) throw new NotFoundException('Không tìm thấy tài liệu');
    return d;
  }

  async update(buildingId: string, id: string, dto: UpdateDocumentDto) {
    await this.ensure(buildingId, id);
    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.archiveCategory !== undefined
          ? { archiveCategory: dto.archiveCategory }
          : {}),
      },
    });
  }

  async remove(buildingId: string, id: string) {
    await this.ensure(buildingId, id);
    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }
}
