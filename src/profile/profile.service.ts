import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateVehicleDto, VehicleDto } from './dto/vehicle.dto';
import {
  EmergencyContactDto,
  UpdateEmergencyContactDto,
} from './dto/emergency-contact.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Profile ─────────────────────────────────────────────────

  /** Returns the account's profile + vehicles, contacts and recent activity. */
  async me(accountId: string) {
    const profile = await this.getProfileForAccount(accountId, {
      vehicles: { orderBy: { createdAt: 'desc' } },
      emergencyContacts: { orderBy: { createdAt: 'asc' } },
    });

    const activityLogs = await this.prisma.activityLog.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return this.toProfileResponse(profile, activityLogs);
  }

  async update(accountId: string, dto: UpdateProfileDto) {
    const profile = await this.getProfileForAccount(accountId);

    const data: Prisma.AccountProfileUpdateInput = {
      ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      ...(dto.fullName !== undefined && { fullName: dto.fullName }),
      ...(dto.displayName !== undefined && { displayName: dto.displayName }),
      ...(dto.dateOfBirth !== undefined && {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.nationality !== undefined && { nationality: dto.nationality }),
      ...(dto.occupation !== undefined && { occupation: dto.occupation }),
      ...(dto.permanentAddress !== undefined && {
        permanentAddress: dto.permanentAddress,
      }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.idType !== undefined && { idType: dto.idType }),
      ...(dto.idNumber !== undefined && { idNumber: dto.idNumber }),
      ...(dto.idIssueDate !== undefined && {
        idIssueDate: dto.idIssueDate ? new Date(dto.idIssueDate) : null,
      }),
      ...(dto.idIssueLocation !== undefined && {
        idIssueLocation: dto.idIssueLocation,
      }),
      ...(dto.idFrontUrl !== undefined && { idFrontUrl: dto.idFrontUrl }),
      ...(dto.idBackUrl !== undefined && { idBackUrl: dto.idBackUrl }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      ...(dto.secondaryPhone !== undefined && {
        secondaryPhone: dto.secondaryPhone,
      }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.zaloNumber !== undefined && { zaloNumber: dto.zaloNumber }),
      ...(dto.zaloLinked !== undefined && { zaloLinked: dto.zaloLinked }),
    };

    // Merge incoming values to recompute completion against the final state.
    const merged = { ...profile, ...data } as typeof profile;
    data.completionPercentage = this.computeCompletion(merged);

    const updated = await this.prisma.accountProfile.update({
      where: { id: profile.id },
      data,
    });

    // Keep Account.fullName in sync when provided.
    if (dto.fullName !== undefined) {
      await this.prisma.account.update({
        where: { id: accountId },
        data: { fullName: dto.fullName },
      });
    }

    return this.toProfileResponse(updated);
  }

  // ── Vehicles ────────────────────────────────────────────────

  async addVehicle(accountId: string, dto: VehicleDto) {
    const profileId = await this.getProfileId(accountId);
    const vehicle = await this.prisma.vehicle.create({
      data: {
        profileId,
        vehicleName: dto.vehicleName,
        licensePlate: dto.licensePlate,
        vehicleType: dto.vehicleType,
        parkingLocation: dto.parkingLocation,
      },
    });
    return this.toVehicle(vehicle);
  }

  async updateVehicle(accountId: string, id: string, dto: UpdateVehicleDto) {
    const profileId = await this.getProfileId(accountId);
    const existing = await this.prisma.vehicle.findFirst({
      where: { id, profileId },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy phương tiện');

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.vehicleName !== undefined && { vehicleName: dto.vehicleName }),
        ...(dto.licensePlate !== undefined && {
          licensePlate: dto.licensePlate,
        }),
        ...(dto.vehicleType !== undefined && { vehicleType: dto.vehicleType }),
        ...(dto.parkingLocation !== undefined && {
          parkingLocation: dto.parkingLocation,
        }),
      },
    });
    return this.toVehicle(vehicle);
  }

  async removeVehicle(accountId: string, id: string) {
    const profileId = await this.getProfileId(accountId);
    const existing = await this.prisma.vehicle.findFirst({
      where: { id, profileId },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy phương tiện');
    await this.prisma.vehicle.delete({ where: { id } });
    return { success: true };
  }

  // ── Emergency contacts ──────────────────────────────────────

  async addContact(accountId: string, dto: EmergencyContactDto) {
    const profileId = await this.getProfileId(accountId);
    const contact = await this.prisma.emergencyContact.create({
      data: {
        profileId,
        contactName: dto.contactName,
        relationship: dto.relationship,
        location: dto.location,
        phoneNumber: dto.phoneNumber,
      },
    });
    return this.toContact(contact);
  }

  async updateContact(
    accountId: string,
    id: string,
    dto: UpdateEmergencyContactDto,
  ) {
    const profileId = await this.getProfileId(accountId);
    const existing = await this.prisma.emergencyContact.findFirst({
      where: { id, profileId },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy liên hệ khẩn cấp');

    const contact = await this.prisma.emergencyContact.update({
      where: { id },
      data: {
        ...(dto.contactName !== undefined && { contactName: dto.contactName }),
        ...(dto.relationship !== undefined && {
          relationship: dto.relationship,
        }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      },
    });
    return this.toContact(contact);
  }

  async removeContact(accountId: string, id: string) {
    const profileId = await this.getProfileId(accountId);
    const existing = await this.prisma.emergencyContact.findFirst({
      where: { id, profileId },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy liên hệ khẩn cấp');
    await this.prisma.emergencyContact.delete({ where: { id } });
    return { success: true };
  }

  // ── Activity ────────────────────────────────────────────────

  async activities(accountId: string) {
    const logs = await this.prisma.activityLog.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
    return logs.map((l) => this.toActivity(l));
  }

  // ── Helpers ─────────────────────────────────────────────────

  private async getProfileId(accountId: string): Promise<string> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { profileId: true },
    });
    if (!account?.profileId) {
      throw new NotFoundException('Không tìm thấy hồ sơ cá nhân');
    }
    return account.profileId;
  }

  private async getProfileForAccount(
    accountId: string,
    include?: Prisma.AccountProfileInclude,
  ) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { profileId: true },
    });
    if (!account?.profileId) {
      throw new NotFoundException('Không tìm thấy hồ sơ cá nhân');
    }
    const profile = await this.prisma.accountProfile.findUnique({
      where: { id: account.profileId },
      ...(include ? { include } : {}),
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ cá nhân');
    }
    return profile as Prisma.AccountProfileGetPayload<{
      include: {
        vehicles: true;
        emergencyContacts: true;
      };
    }>;
  }

  /** Rough completion percentage based on how many key fields are filled. */
  private computeCompletion(p: {
    avatarUrl?: string | null;
    fullName?: string | null;
    displayName?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    nationality?: string | null;
    occupation?: string | null;
    permanentAddress?: string | null;
    location?: string | null;
    idType?: string | null;
    idNumber?: string | null;
    idIssueDate?: Date | null;
    idIssueLocation?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    zaloNumber?: string | null;
  }): number {
    const fields = [
      p.avatarUrl,
      p.fullName,
      p.displayName,
      p.dateOfBirth,
      p.gender,
      p.nationality,
      p.occupation,
      p.permanentAddress,
      p.location,
      p.idType,
      p.idNumber,
      p.idIssueDate,
      p.idIssueLocation,
      p.phoneNumber,
      p.email,
      p.zaloNumber,
    ];
    const filled = fields.filter(
      (v) => v !== null && v !== undefined && v !== '',
    ).length;
    return Math.round((filled / fields.length) * 100);
  }

  // ── Mappers ─────────────────────────────────────────────────

  private toProfileResponse(profile: any, activityLogs?: any[]) {
    return {
      id: profile.id,
      avatarUrl: profile.avatarUrl,
      fullName: profile.fullName,
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender ? profile.gender.toLowerCase() : null,
      nationality: profile.nationality,
      occupation: profile.occupation,
      permanentAddress: profile.permanentAddress,
      location: profile.location,
      isVerifiedResident: profile.isVerifiedResident,
      completionPercentage: profile.completionPercentage,
      idType: profile.idType ? profile.idType.toLowerCase() : null,
      idNumber: profile.idNumber,
      idVerified: profile.idVerified,
      idIssueDate: profile.idIssueDate,
      idIssueLocation: profile.idIssueLocation,
      idFrontUrl: profile.idFrontUrl,
      idBackUrl: profile.idBackUrl,
      phoneNumber: profile.phoneNumber,
      phoneVerified: profile.phoneVerified,
      secondaryPhone: profile.secondaryPhone,
      email: profile.email,
      emailVerified: profile.emailVerified,
      zaloNumber: profile.zaloNumber,
      zaloLinked: profile.zaloLinked,
      ...(profile.vehicles
        ? { vehicles: profile.vehicles.map((v: any) => this.toVehicle(v)) }
        : {}),
      ...(profile.emergencyContacts
        ? {
            emergencyContacts: profile.emergencyContacts.map((c: any) =>
              this.toContact(c),
            ),
          }
        : {}),
      ...(activityLogs
        ? { activityLogs: activityLogs.map((a) => this.toActivity(a)) }
        : {}),
    };
  }

  private toVehicle(v: any) {
    return {
      id: v.id,
      vehicleName: v.vehicleName,
      licensePlate: v.licensePlate,
      vehicleType: v.vehicleType ? v.vehicleType.toLowerCase() : null,
      parkingLocation: v.parkingLocation,
      createdAt: v.createdAt,
    };
  }

  private toContact(c: any) {
    return {
      id: c.id,
      contactName: c.contactName,
      relationship: c.relationship,
      location: c.location,
      phoneNumber: c.phoneNumber,
      createdAt: c.createdAt,
    };
  }

  private toActivity(a: any) {
    return {
      id: a.id,
      type: a.type ? a.type.toLowerCase() : null,
      text: a.text,
      color: a.color,
      createdAt: a.createdAt,
    };
  }
}
