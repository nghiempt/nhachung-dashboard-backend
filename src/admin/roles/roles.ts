import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, PaginationDto } from '../../common/dto/pagination.dto';
import { Roles, ADMIN_ROLES } from '../../common/decorators/roles.decorator';
import { AdminBuilding } from '../../common/decorators/admin-building.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const ALL_ROLES = ['resident', ...ADMIN_ROLES] as const;

export class SetMemberRoleDto {
  @IsIn(ALL_ROLES as unknown as string[])
  role!: string;
}

@Injectable()
export class AdminRolesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(buildingId: string, query: PaginationDto) {
    const where: Prisma.AccountBuildingWhereInput = { buildingId };
    if (query.search) {
      where.account = {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.accountBuilding.findMany({
        where,
        orderBy: { joinedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: { account: { select: { fullName: true, email: true } } },
      }),
      this.prisma.accountBuilding.count({ where }),
    ]);
    const items = rows.map((m) => ({
      id: m.id,
      accountId: m.accountId,
      fullName: m.account.fullName,
      email: m.account.email,
      role: m.role,
      isOwner: m.isOwner,
    }));
    return paginate(items, total, query.page, query.limit);
  }

  async summary(buildingId: string) {
    const grouped = await this.prisma.accountBuilding.groupBy({
      by: ['role'],
      where: { buildingId },
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    for (const g of grouped) counts[g.role] = g._count._all;
    return counts;
  }

  async setRole(
    buildingId: string,
    id: string,
    role: string,
    currentAccountId: string,
  ) {
    const m = await this.prisma.accountBuilding.findFirst({
      where: { id, buildingId },
    });
    if (!m) throw new NotFoundException('Không tìm thấy thành viên');
    // Prevent an admin from changing their own role (e.g. self-demotion that
    // would lock them out of the admin area).
    if (m.accountId === currentAccountId) {
      throw new ForbiddenException('Không thể tự thay đổi vai trò của chính mình');
    }
    return this.prisma.accountBuilding.update({ where: { id }, data: { role } });
  }
}

@ApiTags('admin/roles')
@ApiBearerAuth()
@Roles()
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly service: AdminRolesService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách phân quyền thành viên' })
  list(@AdminBuilding() buildingId: string, @Query() query: PaginationDto) {
    return this.service.list(buildingId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Đếm theo vai trò' })
  summary(@AdminBuilding() buildingId: string) {
    return this.service.summary(buildingId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Gán vai trò' })
  setRole(
    @AdminBuilding() buildingId: string,
    @CurrentUser('accountId') accountId: string,
    @Param('id') id: string,
    @Body() dto: SetMemberRoleDto,
  ) {
    return this.service.setRole(buildingId, id, dto.role, accountId);
  }
}
