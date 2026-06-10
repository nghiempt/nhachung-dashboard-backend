/**
 * Additive, idempotent seed for an ADMIN (Ban quản trị) demo account.
 * Safe to run against a shared DB — it never deletes anything and can be
 * re-run; it only upserts the admin account + its building membership.
 *
 *   Login → admin@gmail.com / Admin@123
 *
 * Run:  npx ts-node prisma/admin-seed.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const DB_URL =
  (process.env.DATABASE_URL ?? '') +
  ((process.env.DATABASE_URL ?? '').includes('?') ? '&' : '?') +
  'connect_timeout=30&pool_timeout=30&socket_timeout=30';

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The shared remote DB is flaky — retry transient connection errors. */
async function withRetry<T>(label: string, fn: () => Promise<T>, tries = 6): Promise<T> {
  let last: unknown;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      console.log(`  …retry ${label} (${i}/${tries})`);
      await sleep(1500 * i);
    }
  }
  throw last;
}

const EMAIL = 'admin@gmail.com';
const PASSWORD = 'Admin@123';
const AVATAR =
  'https://www.figma.com/api/mcp/asset/ee21e768-a070-4e15-ad43-73a28943d4ee';

async function main() {
  // Attach to the existing Landmark 1 building if present (created by the main seed).
  const building = await withRetry('find building', async () =>
    (await prisma.building.findUnique({ where: { slug: 'landmark-1' } })) ??
    (await prisma.building.findFirst({ orderBy: { createdAt: 'asc' } })),
  );

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  let account = await withRetry('find account', () =>
    prisma.account.findUnique({ where: { email: EMAIL } }),
  );

  if (!account) {
    const profile = await withRetry('create profile', () => prisma.accountProfile.create({
      data: {
        avatarUrl: AVATAR,
        fullName: 'Nguyễn Văn Quản',
        displayName: 'Nguyễn Văn Quản',
        nationality: 'Việt Nam',
        occupation: 'Trưởng Ban Quản Trị',
        location: 'TP. Hồ Chí Minh',
        isVerifiedResident: true,
        completionPercentage: 100,
        email: EMAIL,
        emailVerified: true,
        phoneNumber: '0901 222 333',
        phoneVerified: true,
      },
    }));

    account = await withRetry('create account', () => prisma.account.create({
      data: {
        email: EMAIL,
        password: passwordHash,
        status: 'ACTIVE',
        fullName: 'Nguyễn Văn Quản',
        profileId: profile.id,
        settings: { create: { language: 'vi', theme: 'LIGHT' } },
      },
    }));
    console.log('✓ Created admin account:', EMAIL);
  } else {
    account = await withRetry('update account', () => prisma.account.update({
      where: { id: account!.id },
      data: { password: passwordHash, status: 'ACTIVE' },
    }));
    console.log('✓ Admin account already existed — password reset to Admin@123');
  }

  if (building) {
    const existing = await withRetry('find membership', () => prisma.accountBuilding.findUnique({
      where: { accountId_buildingId: { accountId: account!.id, buildingId: building.id } },
    }));
    if (existing) {
      await withRetry('update membership', () => prisma.accountBuilding.update({
        where: { id: existing.id },
        data: { role: 'admin', isActive: true },
      }));
    } else {
      await withRetry('create membership', () => prisma.accountBuilding.create({
        data: {
          accountId: account!.id,
          buildingId: building.id,
          role: 'admin',
          isActive: true,
          isOwner: false,
        },
      }));
    }
    console.log(`✓ Membership: role=admin @ "${building.name}"`);
  } else {
    console.log('⚠ No building found — account created without a building membership.');
  }

  console.log('\n🔑 Đăng nhập:  admin@gmail.com  /  Admin@123\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
