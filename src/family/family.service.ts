import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuildingContextService } from '../common/services/building-context.service';
import { FamilyMemberDto } from './dto/family-member.dto';

const TOTAL_SLOTS = 6;

@Injectable()
export class FamilyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ctx: BuildingContextService,
  ) {}

  /** Resolve the apartment the account belongs to, or throw. */
  private async resolveApartmentId(
    accountId: string,
    buildingId?: string,
  ): Promise<string> {
    const { membership } = await this.ctx.resolveMembership(
      accountId,
      buildingId,
    );
    if (!membership?.apartmentId) {
      throw new NotFoundException('Bạn chưa được gán căn hộ');
    }
    return membership.apartmentId;
  }

  async list(accountId: string, buildingId?: string) {
    const apartmentId = await this.resolveApartmentId(accountId, buildingId);

    const members = await this.prisma.familyMember.findMany({
      where: { apartmentId },
      orderBy: [{ isOwner: 'desc' }, { createdAt: 'asc' }],
      include: { documents: true, vehicles: true },
    });

    const totalMembers = members.length;
    const verifiedCount = members.filter(
      (m) => m.verificationStatus === 'VERIFIED',
    ).length;
    const pendingCount = members.filter(
      (m) => m.verificationStatus === 'PENDING',
    ).length;

    const stats = {
      totalMembers,
      totalSlots: TOTAL_SLOTS,
      emptySlots: Math.max(TOTAL_SLOTS - totalMembers, 0),
      verifiedCount,
      pendingCount,
    };

    return {
      stats,
      members: members.map((m) => this.toMember(m)),
    };
  }

  async create(accountId: string, dto: FamilyMemberDto) {
    const apartmentId = await this.resolveApartmentId(accountId, dto.buildingId);

    const member = await this.prisma.familyMember.create({
      data: {
        apartmentId,
        name: dto.name,
        avatarUrl: dto.avatarUrl,
        role: dto.role,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        isOwner: dto.isOwner ?? false,
        phoneNumber: dto.phoneNumber,
        contactType: dto.contactType,
        notes: dto.notes,
        documents: dto.documents?.length
          ? {
              create: dto.documents.map((d) => ({
                type: d.type,
                number: d.number,
                fileUrl: d.fileUrl,
              })),
            }
          : undefined,
        vehicles: dto.vehicles?.length
          ? {
              create: dto.vehicles.map((v) => ({
                licensePlate: v.licensePlate,
                vehicleType: v.vehicleType,
                vehicleName: v.vehicleName,
                parkingLocation: v.parkingLocation,
              })),
            }
          : undefined,
      },
      include: { documents: true, vehicles: true },
    });

    return this.toMember(member);
  }

  async update(accountId: string, id: string, dto: FamilyMemberDto) {
    const apartmentId = await this.resolveApartmentId(accountId, dto.buildingId);

    const existing = await this.prisma.familyMember.findFirst({
      where: { id, apartmentId },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy thành viên');
    }

    const member = await this.prisma.familyMember.update({
      where: { id },
      data: {
        name: dto.name,
        avatarUrl: dto.avatarUrl,
        role: dto.role,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        isOwner: dto.isOwner,
        phoneNumber: dto.phoneNumber,
        contactType: dto.contactType,
        notes: dto.notes,
        ...(dto.documents
          ? {
              documents: {
                deleteMany: {},
                createMany: {
                  data: dto.documents.map((d) => ({
                    type: d.type,
                    number: d.number,
                    fileUrl: d.fileUrl,
                  })),
                },
              },
            }
          : {}),
        ...(dto.vehicles
          ? {
              vehicles: {
                deleteMany: {},
                createMany: {
                  data: dto.vehicles.map((v) => ({
                    licensePlate: v.licensePlate,
                    vehicleType: v.vehicleType,
                    vehicleName: v.vehicleName,
                    parkingLocation: v.parkingLocation,
                  })),
                },
              },
            }
          : {}),
      },
      include: { documents: true, vehicles: true },
    });

    return this.toMember(member);
  }

  async remove(accountId: string, id: string) {
    const apartmentId = await this.resolveApartmentId(accountId);

    const existing = await this.prisma.familyMember.findFirst({
      where: { id, apartmentId },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy thành viên');
    }
    if (existing.isOwner) {
      throw new BadRequestException('Không thể xóa chủ hộ');
    }

    await this.prisma.familyMember.delete({ where: { id } });
    return { success: true };
  }

  // ── mappers ─────────────────────────────────────────────────

  private toMember(m: any) {
    return {
      id: m.id,
      name: m.name,
      avatarUrl: m.avatarUrl,
      role: m.role,
      gender: m.gender ? m.gender.toLowerCase() : null,
      dateOfBirth: m.dateOfBirth,
      age: this.computeAge(m.dateOfBirth),
      isOwner: m.isOwner,
      phoneNumber: m.phoneNumber,
      phoneVerified: m.phoneVerified,
      contactType: m.contactType,
      verificationStatus: m.verificationStatus.toLowerCase(),
      notes: m.notes,
      documents: (m.documents ?? []).map((d: any) => ({
        id: d.id,
        type: d.type.toLowerCase(),
        number: d.number,
        status: d.status.toLowerCase(),
        fileUrl: d.fileUrl,
      })),
      vehicles: (m.vehicles ?? []).map((v: any) => ({
        id: v.id,
        licensePlate: v.licensePlate,
        vehicleType: v.vehicleType.toLowerCase(),
        vehicleName: v.vehicleName,
        parkingLocation: v.parkingLocation,
      })),
    };
  }

  private computeAge(dob?: Date | null): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }
}
