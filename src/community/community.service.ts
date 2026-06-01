import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  async list(accountId: string, buildingId?: string, limit = 6) {
    const bId = await this.ctx.resolve(accountId, buildingId);
    const rows = await this.prisma.communityPost.findMany({
      where: { buildingId: bId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      thumbnailUrl: p.thumbnailUrl,
      viewCount: p.viewCount,
      createdAt: p.createdAt,
    }));
  }
}
