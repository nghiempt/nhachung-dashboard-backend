import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const AVATAR =
  'https://www.figma.com/api/mcp/asset/ee21e768-a070-4e15-ad43-73a28943d4ee';

async function reset() {
  // Order matters due to FKs; CASCADE handles most children.
  await prisma.notificationRead.deleteMany();
  await prisma.notificationAttachment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.feedbackHistory.deleteMany();
  await prisma.feedbackImage.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.document.deleteMany();
  await prisma.documentCategory.deleteMany();
  await prisma.news.deleteMany();
  await prisma.event.deleteMany();
  await prisma.communityPost.deleteMany();
  // transparency section
  await prisma.financialLineItem.deleteMany();
  await prisma.financialPeriod.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.fundPeriod.deleteMany();
  await prisma.blockCollection.deleteMany();
  await prisma.maintenanceJob.deleteMany();
  await prisma.maintenanceFund.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.buildingSystem.deleteMany();
  await prisma.kpiMetric.deleteMany();
  await prisma.kpiCategory.deleteMany();
  await prisma.kpiPeriod.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.report.deleteMany();
  await prisma.familyMemberDocument.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.apartmentFee.deleteMany();
  await prisma.apartmentContract.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.accountNotificationSetting.deleteMany();
  await prisma.accountSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.accountBuilding.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.account.deleteMany();
  await prisma.accountProfile.deleteMany();
  await prisma.building.deleteMany();
}

async function main() {
  console.log('🌱 Resetting…');
  await reset();

  // ── Buildings ──────────────────────────────────────────────
  const landmark1 = await prisma.building.create({
    data: {
      name: 'Landmark 1',
      slug: 'landmark-1',
      location: 'Vinhomes Central Park',
      address: '720A Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh',
      status: 'active',
      description: 'Toà căn hộ cao cấp thuộc Vinhomes Central Park.',
    },
  });
  const landmark2 = await prisma.building.create({
    data: { name: 'Landmark 2', slug: 'landmark-2', location: 'Vinhomes Central Park', status: 'active' },
  });
  const grandMarina = await prisma.building.create({
    data: { name: 'The Grand Marina', slug: 'the-grand-marina', location: 'Quận 1, TP. Hồ Chí Minh', status: 'active' },
  });

  // ── Apartment A-12.05 in Landmark 1 ────────────────────────
  const apartment = await prisma.apartment.create({
    data: {
      buildingId: landmark1.id,
      code: 'A-12.05',
      block: 'Tháp A',
      floor: 12,
      totalFloors: 47,
      areaSqm: 95,
      totalAreaSqm: 102,
      bedrooms: 3,
      bathrooms: 2,
      balconies: 2,
      orientation: 'Đông Nam · View sông',
      furnishingStatus: 'Đầy đủ nội thất cao cấp',
      ownershipType: 'Mua — Sở hữu vĩnh viễn',
      parkingLocations: 'B1-A21 (ô tô) · B2-M14 (xe máy)',
      status: 'active',
      moveInDate: new Date('2022-01-01'),
      contract: {
        create: {
          contractNumber: 'LM1-2022-A1205-01',
          ownershipType: 'Mua — Sở hữu vĩnh viễn',
          contractDate: new Date('2022-01-10'),
          handoverDate: new Date('2022-01-15'),
          ownerName: 'Trần Hoàng Chris',
          registrationStatus: 'Đã cấp sổ hồng',
        },
      },
      fees: {
        create: [
          { period: '2024-05', name: 'Phí quản lý', amount: 3800000, status: 'PAID' },
          { period: '2024-05', name: 'Phí giữ xe ô tô (B1-A21)', amount: 1200000, status: 'PAID' },
          { period: '2024-05', name: 'Phí giữ xe máy (B2-M14)', amount: 200000, status: 'PAID' },
          { period: '2024-05', name: 'Tiền điện', amount: 1560000, status: 'PAID' },
          { period: '2024-05', name: 'Tiền nước', amount: 320000, status: 'UNPAID', dueDate: new Date('2024-06-10') },
        ],
      },
    },
  });

  // ── Demo account + profile + settings ──────────────────────
  const passwordHash = await bcrypt.hash('Default@123', 10);
  const profile = await prisma.accountProfile.create({
    data: {
      avatarUrl: AVATAR,
      fullName: 'Trần Hoàng Chris',
      displayName: 'Chris Tran',
      dateOfBirth: new Date('1990-08-15'),
      gender: 'MALE',
      nationality: 'Việt Nam',
      occupation: 'Kỹ sư phần mềm',
      permanentAddress: '123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh',
      location: 'TP. Hồ Chí Minh',
      isVerifiedResident: true,
      completionPercentage: 85,
      idType: 'CCCD',
      idNumber: '079 190 015 820',
      idVerified: true,
      idIssueDate: new Date('2021-03-20'),
      idIssueLocation: 'Cục Cảnh sát QLHC về TTXH — TP. Hồ Chí Minh',
      phoneNumber: '0912 345 678',
      phoneVerified: true,
      secondaryPhone: null,
      email: 'chris.tran@gmail.com',
      emailVerified: false,
      zaloNumber: '0912 345 678',
      zaloLinked: true,
      vehicles: {
        create: [
          { vehicleName: 'Toyota Camry 2022', licensePlate: '51G-123.45', vehicleType: 'CAR', parkingLocation: 'Tầng hầm B1-A21' },
          { vehicleName: 'Honda Air Blade', licensePlate: '59K-999.00', vehicleType: 'MOTORBIKE', parkingLocation: 'Tầng hầm B2-M14' },
        ],
      },
      emergencyContacts: {
        create: [
          { contactName: 'Trần Thị Hoa', relationship: 'Vợ', location: 'Cùng căn hộ A-12.05', phoneNumber: '0987 654 321' },
          { contactName: 'Trần Văn Bình', relationship: 'Bố', location: 'Quận 1, TP.HCM', phoneNumber: '0901 234 567' },
        ],
      },
    },
  });

  const account = await prisma.account.create({
    data: {
      email: 'default@gmail.com',
      password: passwordHash,
      status: 'ACTIVE',
      fullName: 'Trần Hoàng Chris',
      companyName: 'Spa Mai Anh',
      profileId: profile.id,
      settings: {
        create: {
          language: 'vi',
          theme: 'LIGHT',
          twoFactorEnabled: true,
          passwordChangedAt: new Date('2026-02-28'),
          notificationSettings: {
            create: [
              { key: 'fee', label: 'Thông báo phí quản lý', description: 'Nhắc khi đến kỳ thanh toán và xác nhận đã thu', isEnabled: true },
              { key: 'maintenance', label: 'Bảo trì & Sửa chữa', description: 'Lịch bảo trì, sửa chữa ảnh hưởng căn hộ', isEnabled: true },
              { key: 'emergency', label: 'Thông báo khẩn cấp', description: 'Cảnh báo an ninh, sự cố nghiêm trọng', isEnabled: true, isLocked: true },
              { key: 'event', label: 'Sự kiện cộng đồng', description: 'Hoạt động, sự kiện của cư dân', isEnabled: true },
              { key: 'document', label: 'Tài liệu & Thông tin mới', description: 'Tài liệu, biên bản, thông tin mới được đăng', isEnabled: false },
            ],
          },
        },
      },
      activityLogs: {
        create: [
          { type: 'FEEDBACK', text: 'Gửi góp ý về tiếng ồn hành lang tầng 12', color: '#4137f9', createdAt: new Date('2026-05-30T09:14:00+07:00') },
          { type: 'PAYMENT', text: 'Thanh toán phí quản lý tháng 5/2026', color: '#1c9d5f', createdAt: new Date('2026-05-22T14:30:00+07:00') },
          { type: 'SERVICE', text: 'Đăng ký dịch vụ vệ sinh định kỳ', color: '#c8761b', createdAt: new Date('2026-05-18T10:05:00+07:00') },
        ],
      },
    },
  });

  // Membership: Landmark 1 is owned + active. The other two stay "explore".
  await prisma.accountBuilding.create({
    data: {
      accountId: account.id,
      buildingId: landmark1.id,
      apartmentId: apartment.id,
      isOwner: true,
      isActive: true,
      role: 'resident',
    },
  });

  // ── Family members ─────────────────────────────────────────
  const chris = await prisma.familyMember.create({
    data: {
      apartmentId: apartment.id,
      name: 'Trần Hoàng Chris',
      avatarUrl: AVATAR,
      role: 'Chủ hộ',
      gender: 'MALE',
      dateOfBirth: new Date('1990-08-15'),
      isOwner: true,
      phoneNumber: '0912 345 678',
      phoneVerified: true,
      verificationStatus: 'VERIFIED',
      documents: { create: [{ type: 'CCCD', number: '079 190 015 820', status: 'VERIFIED' }] },
    },
  });
  await prisma.vehicle.create({ data: { memberId: chris.id, licensePlate: '51G-123.45', vehicleType: 'CAR' } });

  const hoa = await prisma.familyMember.create({
    data: {
      apartmentId: apartment.id,
      name: 'Trần Thị Hoa',
      role: 'Vợ',
      gender: 'FEMALE',
      dateOfBirth: new Date('1993-04-22'),
      phoneNumber: '0987 654 321',
      phoneVerified: true,
      verificationStatus: 'VERIFIED',
      documents: { create: [{ type: 'CCCD', number: '079 193 002 114', status: 'VERIFIED' }] },
    },
  });
  await prisma.vehicle.create({ data: { memberId: hoa.id, licensePlate: '51F-338.22', vehicleType: 'CAR' } });

  await prisma.familyMember.create({
    data: {
      apartmentId: apartment.id,
      name: 'Trần Hoàng Minh',
      role: 'Con trai',
      gender: 'MALE',
      dateOfBirth: new Date('2017-03-05'),
      contactType: 'Qua phụ huynh',
      verificationStatus: 'PENDING',
      notes: 'Cần nộp bản sao GCKS để xác minh',
      documents: { create: [{ type: 'BIRTH_CERTIFICATE', status: 'PENDING' }] },
    },
  });

  // ── Notifications (Landmark 1) ─────────────────────────────
  await seedNotifications(landmark1.id, account.id);

  // ── Documents ──────────────────────────────────────────────
  await seedDocuments(landmark1.id);

  // ── Feedbacks ──────────────────────────────────────────────
  await seedFeedbacks(landmark1.id, account.id);

  // ── News ───────────────────────────────────────────────────
  await seedNews(landmark1.id, account.id);

  // ── Events ─────────────────────────────────────────────────
  await seedEvents(landmark1.id);

  // ── Community posts ────────────────────────────────────────
  await seedCommunity(landmark1.id);

  // ── Transparency section (Landmark 1) ──────────────────────
  await seedFinancial(landmark1.id);
  await seedFund(landmark1.id);
  await seedOperations(landmark1.id);
  await seedKpi(landmark1.id);
  await seedReports(landmark1.id);
  await seedArchive(landmark1.id, account.id);

  console.log('✅ Seed complete.');
  console.log('   Demo login → default@gmail.com / Default@123');
}

async function seedNotifications(buildingId: string, accountId: string) {
  const author = { authorName: 'Ban Quản Trị Landmark 1', authorRole: 'Quản trị tòa nhà', authorVerified: true };

  const n1 = await prisma.notification.create({
    data: {
      buildingId,
      ...author,
      eyebrow: 'THÔNG BÁO',
      title: 'Thông báo về việc bảo trì hệ thống PCCC định kỳ',
      category: 'MAINTENANCE',
      iconType: 'BELL',
      isUrgent: false,
      viewCount: 1024,
      publishedAt: new Date('2026-05-26T10:30:00+07:00'),
      body: [
        'Kính gửi quý cư dân Landmark 1,',
        'Ban quản trị phối hợp cùng Ban quản lý tòa nhà xin thông báo lịch bảo trì hệ thống phòng cháy chữa cháy (PCCC) định kỳ hàng tháng.',
        'Trong thời gian bảo trì, chuông báo cháy có thể sẽ kêu thử nghiệm ngắt quãng. Rất mong nhận được sự thông cảm của quý cư dân.',
      ],
      timeCard: {
        heading: 'Lịch bảo trì PCCC',
        rows: [
          '📅 Ngày thực hiện: 28/05/2026',
          '⏰ Thời gian: Từ 08:30 đến 16:30 (giờ hành chính)',
          '📍 Phạm vi: Toàn bộ sảnh và hành lang các tầng Landmark 1',
        ],
      },
      checklist: [
        'Kiểm tra tủ điều khiển báo cháy trung tâm',
        'Đo áp lực nước đầu ra tại các họng cứu hỏa hành lang',
        'Thử nghiệm đầu dò khói và chuông cảnh báo ngắt quãng',
        'Bảo dưỡng hệ thống máy bơm chữa cháy áp lực cao',
      ],
      alertText:
        '⚠️ Khuyến cáo: Hệ thống sẽ phát chuông báo thử nghiệm ngắt quãng. Cư dân không cần hoảng loạn di tản khi nghe tiếng chuông trong khung giờ này.',
      signoff: { lines: ['Chúng tôi chân thành cảm ơn sự hợp tác của quý cư dân.'], signedBy: 'Ban Quản Trị Landmark 1', title: 'Vinhomes Central Park' },
      attachments: {
        create: [{ name: 'Ke-hoach-bao-tri-PCCC-2026.pdf', type: 'PDF', sizeBytes: 1_468_006, url: 'https://172.104.188.44:9000/nhachung/notifications/Ke-hoach-bao-tri-PCCC-2026.pdf' }],
      },
    },
  });

  await prisma.notification.create({
    data: {
      buildingId,
      ...author,
      eyebrow: 'THÔNG BÁO',
      title: 'Thông báo điều chỉnh phí giữ xe tháng 6/2026',
      category: 'FINANCE',
      iconType: 'INFO',
      viewCount: 2150,
      publishedAt: new Date('2026-05-26T09:15:00+07:00'),
      body: [
        'Kính gửi quý cư dân và chủ căn hộ Landmark 1,',
        'Ban quản trị xin thông báo về việc điều chỉnh mức phí trông giữ phương tiện áp dụng từ ngày 01/06/2026.',
      ],
      timeCard: {
        heading: 'Biểu phí gửi xe điều chỉnh mới',
        rows: [
          '🚗 Xe ô tô con: 1.500.000 VNĐ / tháng (Tăng 100.000đ)',
          '🏍️ Xe máy: 120.000 VNĐ / tháng (Giữ nguyên)',
          '🚲 Xe đạp điện: 50.000 VNĐ / tháng (Giữ nguyên)',
        ],
      },
      alertText: '🚨 Lưu ý: Cư dân đã đóng phí trước theo kỳ hạn 3-6 tháng sẽ không bị truy thu phần chênh lệch.',
      attachments: { create: [{ name: 'Quyet-dinh-dieu-chinh-phi-xe.pdf', type: 'PDF', sizeBytes: 911_360, url: 'https://172.104.188.44:9000/nhachung/notifications/Quyet-dinh-dieu-chinh-phi-xe.pdf' }] },
    },
  });

  await prisma.notification.create({
    data: {
      buildingId, ...author, eyebrow: 'THÔNG BÁO', title: 'Lịch cắt điện khu vực Block A', category: 'ANNOUNCEMENT', iconType: 'LIGHTNING',
      viewCount: 1450, publishedAt: new Date('2026-05-25T08:00:00+07:00'),
      body: ['Kính gửi cư dân Block A,', 'Công ty điện lực phối hợp Ban quản lý sẽ tạm ngắt cung cấp điện tại Block A để đấu nối trạm biến áp mới.'],
      timeCard: { heading: 'Thời gian ngắt điện Block A', rows: ['📅 Ngày: 29/05/2026', '⏰ Thời gian: 13:00 - 16:00', '📍 Phạm vi: Toàn bộ Block A tầng 1-25'] },
    },
  });

  await prisma.notification.create({
    data: {
      buildingId, ...author, eyebrow: 'THÔNG BÁO', title: 'Kết quả họp BQT tháng 5/2026', category: 'COMMUNITY', iconType: 'DOCUMENT',
      viewCount: 940, publishedAt: new Date('2026-05-22T10:00:00+07:00'),
      body: ['Kính gửi quý cư dân Landmark 1,', 'Ngày 20/05/2026 Ban quản trị đã tổ chức cuộc họp thường niên tháng 5 và thống nhất nhiều nội dung quan trọng.'],
      checklist: ['Thông qua kế hoạch chống thấm bể bơi tầng 4', 'Ký mới hợp đồng vệ sinh cảnh quan', 'Thành lập tiểu ban hòa giải tranh chấp tiếng ồn', 'Tổ chức Tết Thiếu nhi 1/6'],
    },
  });

  await prisma.notification.create({
    data: {
      buildingId, authorName: 'Ban Quản Trị Sunshine', authorRole: 'Ban tổ chức sự kiện', authorVerified: true,
      eyebrow: 'SỰ KIỆN', title: 'Ngày hội cư dân 2026', category: 'EVENT', iconType: 'CALENDAR', isUrgent: false,
      viewCount: 3400, publishedAt: new Date('2026-05-18T10:00:00+07:00'),
      body: ['Chào mừng ngày hội cư dân 2026!', 'Chương trình mở cửa miễn phí cho tất cả gia đình cư dân với nhiều gian hàng ẩm thực và mini game.'],
      timeCard: { heading: 'Thông tin Ngày hội cư dân', rows: ['📅 Thời gian: Chủ Nhật 31/05/2026 (cả ngày)', '📍 Địa điểm: Công viên trung tâm & bể bơi Block B', '🎁 Quà tặng Quốc tế thiếu nhi cho các cháu'] },
      attachments: { create: [{ name: 'Chuong-trinh-ngay-hoi-cu-dan.pdf', type: 'PDF', sizeBytes: 3_565_158, url: 'https://172.104.188.44:9000/nhachung/notifications/Chuong-trinh-ngay-hoi-cu-dan.pdf' }] },
    },
  });

  // mark the two oldest as read for the demo account
  await prisma.notificationRead.create({ data: { notificationId: n1.id, accountId } }).catch(() => undefined);
}

async function seedDocuments(buildingId: string) {
  const cats = await Promise.all(
    [
      ['Nội quy - Quy định', 12],
      ['Biên bản họp', 28],
      ['Hợp đồng - Biểu mẫu', 15],
      ['Hướng dẫn sử dụng', 8],
      ['Tài liệu khác', 6],
    ].map(([name]) =>
      prisma.documentCategory.create({ data: { buildingId, name: name as string } }),
    ),
  );
  const byName = (n: string) => cats.find((c) => c.name === n)!.id;

  await prisma.document.createMany({
    data: [
      { buildingId, categoryId: byName('Nội quy - Quy định'), name: 'Nội quy quản lý và sử dụng chung cư Landmark 1', fileType: 'PDF', sizeBytes: 2_516_582, viewCount: 1256, url: 'https://172.104.188.44:9000/nhachung/documents/noi-quy-chung-cu.pdf' },
      { buildingId, categoryId: byName('Biên bản họp'), name: 'Biên bản họp BQT tháng 5/2026', fileType: 'DOCX', sizeBytes: 466_944, viewCount: 892, url: 'https://172.104.188.44:9000/nhachung/documents/bien-ban-hop-5-2026.docx' },
      { buildingId, categoryId: byName('Hợp đồng - Biểu mẫu'), name: 'Biểu mẫu đăng ký thẻ ra vào', fileType: 'PDF', sizeBytes: 245_760, viewCount: 745, url: 'https://172.104.188.44:9000/nhachung/documents/bieu-mau-the-ra-vao.pdf' },
      { buildingId, categoryId: byName('Hướng dẫn sử dụng'), name: 'Hướng dẫn sử dụng app Nhà Chung', fileType: 'PDF', sizeBytes: 3_250_585, viewCount: 530, url: 'https://172.104.188.44:9000/nhachung/documents/huong-dan-app.pdf' },
      { buildingId, categoryId: byName('Hợp đồng - Biểu mẫu'), name: 'Bảng kê chi phí vận hành Q1/2026', fileType: 'XLSX', sizeBytes: 189_440, viewCount: 410, url: 'https://172.104.188.44:9000/nhachung/documents/chi-phi-van-hanh-q1.xlsx' },
    ],
  });
}

async function seedFeedbacks(buildingId: string, accountId: string) {
  await prisma.feedback.create({
    data: {
      code: '#PA-240525-0012', buildingId, accountId,
      category: 'Vệ sinh - Môi trường',
      title: 'Rác thải không được dọn dẹp ở tầng hầm B2',
      description: 'Khu vực gần thang thoát hiểm và cột B2-07 có nhiều rác thải sinh hoạt, mùi hôi khó chịu. Đề nghị ban quản lý kiểm tra và xử lý sớm.',
      priority: 'MEDIUM', location: 'Tầng hầm B2 - Gần cột B2-07', status: 'PROCESSING',
      createdAt: new Date('2026-05-25T10:30:00+07:00'),
      history: {
        create: [
          { label: 'Ban quản lý đã tiếp nhận phản ánh', description: 'Cảm ơn Anh/Chị đã phản ánh. Chúng tôi đã tiếp nhận và sẽ kiểm tra ngay.', status: 'PROCESSING', completed: true, createdAt: new Date('2026-05-25T10:45:00+07:00') },
          { label: 'Đang xử lý', description: 'Bộ phận vệ sinh đã được thông báo và đang tiến hành xử lý.', status: 'PROCESSING', completed: true, createdAt: new Date('2026-05-25T11:20:00+07:00') },
          { label: 'Chờ phản hồi từ cư dân', status: 'AWAITING', completed: false },
        ],
      },
    },
  });

  await prisma.feedback.create({
    data: {
      code: '#PA-240524-0011', buildingId, accountId, category: 'Thang máy',
      title: 'Thang máy số 2 bị kẹt và dừng đột ngột', description: 'Thang máy số 2 toà A dừng đột ngột giữa tầng 8 và 9 lúc giờ cao điểm.',
      priority: 'HIGH', location: 'Thang máy số 2 - Toà A', status: 'COMPLETED', createdAt: new Date('2026-05-24T16:45:00+07:00'),
      history: { create: [{ label: 'Đã tiếp nhận', status: 'PROCESSING', completed: true, createdAt: new Date('2026-05-24T16:50:00+07:00') }, { label: 'Đã hoàn thành sửa chữa', status: 'COMPLETED', completed: true, createdAt: new Date('2026-05-24T20:10:00+07:00') }] },
    },
  });

  await prisma.feedback.create({
    data: {
      code: '#PA-240524-0010', buildingId, accountId, category: 'An ninh',
      title: 'Đề nghị tăng cường camera tại sảnh tầng hầm', description: 'Khu vực sảnh thang máy tầng hầm B1 thiếu camera giám sát.',
      priority: 'MEDIUM', location: 'Sảnh thang máy B1', status: 'AWAITING', createdAt: new Date('2026-05-23T09:15:00+07:00'),
      history: { create: [{ label: 'Đã tiếp nhận', status: 'PROCESSING', completed: true, createdAt: new Date('2026-05-23T09:30:00+07:00') }] },
    },
  });
}

async function seedNews(buildingId: string, authorId: string) {
  await prisma.news.create({
    data: {
      buildingId, authorId, authorName: 'Ban quản trị Landmark 1', authorLabel: 'BQT',
      title: 'Kết quả họp Ban quản trị tháng 5/2026 — Thông qua ngân sách nâng cấp PCCC và thang máy',
      excerpt: 'Cuộc họp thường niên tháng 5 đã thông qua nhiều quyết định quan trọng về ngân sách vận hành.',
      content: 'Nội dung chi tiết kết quả họp Ban quản trị tháng 5/2026...',
      category: 'ANNOUNCEMENT', isPinned: true, readMinutes: 5, viewCount: 1820,
      tags: ['BQT', 'Ngân sách', 'PCCC'], publishedAt: new Date('2026-05-22T08:00:00+07:00'),
    },
  });
  await prisma.news.createMany({
    data: [
      { buildingId, authorName: 'Ban quản trị', authorLabel: 'BQT', title: 'Ngày hội cư dân Landmark 1 — "Kết nối hàng xóm" diễn ra 1/6/2026', excerpt: 'Sự kiện thường niên Ngày hội cư dân tổ chức tại khu hồ bơi tầng 3 và sân thượng toà A.', category: 'EVENT', readMinutes: 3, viewCount: 1540, tags: ['Sự kiện', 'Cộng đồng'], publishedAt: new Date('2026-05-20T09:00:00+07:00') },
      { buildingId, authorName: 'Kỹ thuật tòa nhà', authorLabel: 'KT', title: 'Bảo trì hệ thống cấp nước toà B ngày 25/5', excerpt: 'Tạm ngưng cấp nước toà B trong thời gian bảo trì đường ống.', category: 'MAINTENANCE', readMinutes: 2, viewCount: 980, tags: ['Bảo trì'], publishedAt: new Date('2026-05-19T10:00:00+07:00') },
      { buildingId, authorName: 'Ban quản trị', authorLabel: 'BQT', title: 'Quy định mới về chuyển nhượng chỗ đỗ xe tầng hầm', excerpt: 'Cập nhật quy định chuyển nhượng chỗ đỗ xe áp dụng từ tháng 6.', category: 'ANNOUNCEMENT', readMinutes: 4, viewCount: 2841, tags: ['Quy định', 'Đỗ xe'], publishedAt: new Date('2026-05-15T08:30:00+07:00') },
      { buildingId, authorName: 'Ban quản trị', authorLabel: 'BQT', title: 'Hướng dẫn đăng ký thẻ từ ra vào cho người thân', excerpt: 'Các bước đăng ký thẻ từ cho thành viên gia đình và khách.', category: 'COMMUNITY', readMinutes: 3, viewCount: 1920, tags: ['Hướng dẫn'], publishedAt: new Date('2026-05-12T14:00:00+07:00') },
    ],
  });
}

async function seedEvents(buildingId: string) {
  await prisma.event.createMany({
    data: [
      { buildingId, title: 'Bảo trì hệ thống cấp nước toà B', content: 'Bảo trì đường ống cấp nước.', startAt: new Date('2026-06-25T08:00:00+07:00'), endAt: new Date('2026-06-25T17:00:00+07:00'), location: 'Tầng 1–5 toà B', status: 'UPCOMING' },
      { buildingId, title: 'Hướng dẫn nội quy cho cư dân mới', content: 'Buổi hướng dẫn nội quy.', startAt: new Date('2026-06-26T18:00:00+07:00'), endAt: new Date('2026-06-26T19:30:00+07:00'), location: 'Phòng sinh hoạt cộng đồng', status: 'UPCOMING' },
      { buildingId, title: 'Ngày hội cư dân 1/6', content: 'Ngày hội cư dân thường niên.', startAt: new Date('2026-06-01T08:00:00+07:00'), endAt: new Date('2026-06-01T21:00:00+07:00'), location: 'Hồ bơi & Sân thượng', regulations: 'Miễn phí cho tất cả cư dân.', status: 'UPCOMING' },
    ],
  });
}

async function seedCommunity(buildingId: string) {
  await prisma.communityPost.createMany({
    data: [
      { buildingId, title: 'Cập nhật tiến độ bảo trì thang máy tháng 5/2026', content: 'Tiến độ bảo trì đạt 80%.', viewCount: 284, createdAt: new Date('2026-05-30T07:00:00+07:00') },
      { buildingId, title: 'Ngày hội cư dân Landmark 1 2026', content: 'Thông tin ngày hội cư dân.', viewCount: 256, createdAt: new Date('2026-05-29T09:00:00+07:00') },
      { buildingId, title: 'Lớp học Yoga miễn phí cho cư dân sáng thứ 7', content: 'Đăng ký lớp Yoga miễn phí.', viewCount: 89, createdAt: new Date('2026-05-28T08:00:00+07:00') },
    ],
  });
}

// ═══════════════════════════════════════════════════════════
// Transparency section seed (anchored to "now" = May 2026)
// ═══════════════════════════════════════════════════════════
const M = (n: number) => BigInt(Math.round(n));

async function seedFinancial(buildingId: string) {
  const trend = [
    { period: '2025-12', inc: 2410000000, exp: 2050000000 },
    { period: '2026-01', inc: 2520000000, exp: 2080000000 },
    { period: '2026-02', inc: 2480000000, exp: 2010000000 },
    { period: '2026-03', inc: 2610000000, exp: 2150000000 },
    { period: '2026-04', inc: 2531000000, exp: 2342000000 },
  ];
  for (const t of trend) {
    await prisma.financialPeriod.create({
      data: { buildingId, period: t.period, totalIncome: M(t.inc), totalExpense: M(t.exp), surplus: M(t.inc - t.exp) },
    });
  }
  // Current month with full detail + breakdown line items
  await prisma.financialPeriod.create({
    data: {
      buildingId, period: '2026-05',
      totalIncome: M(2845600000), totalExpense: M(2138900000), surplus: M(706700000),
      incomeChangePct: 12.4, expenseChangePct: -8.7, surplusChangePct: 28.6,
      collectionRate: 98.6, expenseRatio: 75.2, fundUsageRate: 0,
      collectionRateChangePct: 2.4, expenseRatioChangePct: -3.1,
      unitsPaid: 856, unitsTotal: 868,
      lineItems: {
        create: [
          { kind: 'INCOME', name: 'Phí quản lý chung cư', category: 'MANAGEMENT', amount: M(1764272000), pctOfTotal: 62, comparisonPct: 8.2, comparisonDirection: 'UP', subInfo: 'Đạt 98.6% kế hoạch • 856/868 căn hộ', sortOrder: 1 },
          { kind: 'INCOME', name: 'Phí gửi xe', category: 'PARKING', amount: M(512208000), pctOfTotal: 18, comparisonPct: 15.3, comparisonDirection: 'UP', subInfo: '512 ô tô • 1.246 xe máy', sortOrder: 2 },
          { kind: 'INCOME', name: 'Cho thuê mặt bằng', category: 'RENTAL', amount: M(341472000), pctOfTotal: 12, comparisonPct: 22.4, comparisonDirection: 'UP', subInfo: '12 đơn vị thuê', sortOrder: 3 },
          { kind: 'INCOME', name: 'Lãi tiền gửi quỹ', category: 'INTEREST', amount: M(170736000), pctOfTotal: 6, comparisonPct: 3.1, comparisonDirection: 'UP', subInfo: 'Quỹ bảo trì 6.5%/năm', sortOrder: 4 },
          { kind: 'INCOME', name: 'Phí dịch vụ tiện ích', category: 'AMENITY', amount: M(56912000), pctOfTotal: 2, comparisonPct: -4.8, comparisonDirection: 'DOWN', subInfo: 'Hồ bơi • Phòng gym • BBQ', sortOrder: 5 },
          { kind: 'EXPENSE', name: 'Vận hành & quản lý', category: 'OPERATION', amount: M(748600000), pctOfTotal: 35, comparisonPct: 0.4, comparisonDirection: 'NEUTRAL', subInfo: '35% tổng chi', color: '#7a6dff', sortOrder: 1 },
          { kind: 'EXPENSE', name: 'Điện nước chung', category: 'UTILITIES', amount: M(470800000), pctOfTotal: 22, comparisonPct: 11.7, comparisonDirection: 'UP', subInfo: '22% • Tăng do mùa nóng', color: '#ff9d6a', sortOrder: 2 },
          { kind: 'EXPENSE', name: 'Bảo trì & sửa chữa', category: 'MAINTENANCE', amount: M(385200000), pctOfTotal: 18, comparisonPct: 14.2, comparisonDirection: 'UP', subInfo: '18% • Thay thế thiết bị PCCC', color: '#3ddcb6', sortOrder: 3 },
          { kind: 'EXPENSE', name: 'Dịch vụ & tiện ích', category: 'SERVICES', amount: M(256600000), pctOfTotal: 12, comparisonPct: -2.1, comparisonDirection: 'DOWN', subInfo: '12% • Hồ bơi, gym, BBQ', color: '#a99cff', sortOrder: 4 },
          { kind: 'EXPENSE', name: 'Nhân sự & lương', category: 'PAYROLL', amount: M(171100000), pctOfTotal: 8, comparisonPct: 0, comparisonDirection: 'NEUTRAL', subInfo: '8% • 24 nhân viên', color: '#c7d3ff', sortOrder: 5 },
          { kind: 'EXPENSE', name: 'Khác', category: 'OTHER', amount: M(106600000), pctOfTotal: 5, comparisonDirection: 'NEUTRAL', subInfo: '5% tổng chi', color: '#f5b5d4', sortOrder: 6 },
        ],
      },
    },
  });

  // Transaction ledger
  const tx = [
    { code: '#GD-260525-038', type: 'INCOME', category: 'Phí quản lý', description: 'Thu phí quản lý kỳ T5/2026 — Block A', subInfo: '76 căn hộ Block A', paymentMethod: 'Chuyển khoản', amount: 168080000, d: '2026-05-25' },
    { code: '#GD-260524-037', type: 'EXPENSE', category: 'Bảo trì', description: 'Thay thế bình chữa cháy CO₂ định kỳ', subInfo: 'Công ty PCCC Sài Gòn • HĐ 2026-PC-08', vendorName: 'Công ty PCCC Sài Gòn', contractRef: '2026-PC-08', paymentMethod: 'Chuyển khoản', amount: 84500000, d: '2026-05-24' },
    { code: '#GD-260523-036', type: 'INCOME', category: 'Phí gửi xe', description: 'Phí gửi xe ô tô tháng 5/2026 — Block B', subInfo: '142 chỗ • 1.500.000đ/chỗ', paymentMethod: 'Chuyển khoản', amount: 213000000, d: '2026-05-23' },
    { code: '#GD-260522-035', type: 'EXPENSE', category: 'Điện nước', description: 'Hóa đơn tiền điện khu vực chung T4/2026', subInfo: 'EVN HCM • HĐ PD15-22', vendorName: 'EVN HCM', contractRef: 'PD15-22', paymentMethod: 'Chuyển khoản', amount: 312680000, d: '2026-05-22' },
    { code: '#GD-260521-034', type: 'INCOME', category: 'Cho thuê', description: 'Cho thuê mặt bằng cửa hàng tầng 1 — Tháng 5', subInfo: 'Highland Coffee • HĐ MB-04', vendorName: 'Highland Coffee', contractRef: 'MB-04', paymentMethod: 'Chuyển khoản', amount: 78000000, d: '2026-05-21' },
    { code: '#GD-260520-033', type: 'EXPENSE', category: 'Nhân sự', description: 'Lương nhân viên vận hành tháng 5/2026', subInfo: '24 nhân viên • Bao gồm BHXH', paymentMethod: 'Chuyển khoản', amount: 171112000, d: '2026-05-20' },
    { code: '#GD-260519-032', type: 'INCOME', category: 'Phí quản lý', description: 'Thu phí quản lý kỳ T5/2026 — Block B', subInfo: '88 căn hộ Block B', paymentMethod: 'Chuyển khoản', amount: 195360000, d: '2026-05-19' },
    { code: '#GD-260518-031', type: 'EXPENSE', category: 'Dịch vụ', description: 'Chi phí vệ sinh cảnh quan tháng 5', subInfo: 'Công ty MT Xanh • HĐ VS-11', vendorName: 'Công ty MT Xanh', contractRef: 'VS-11', paymentMethod: 'Tiền mặt', amount: 64200000, d: '2026-05-18' },
  ];
  for (const t of tx) {
    await prisma.transaction.create({
      data: { buildingId, code: t.code, type: t.type as any, category: t.category, description: t.description, subInfo: t.subInfo, vendorName: (t as any).vendorName, contractRef: (t as any).contractRef, paymentMethod: t.paymentMethod, amount: M(t.amount), occurredAt: new Date(t.d + 'T10:00:00+07:00') },
    });
  }
}

async function seedFund(buildingId: string) {
  await prisma.maintenanceFund.create({
    data: {
      buildingId, balance: M(8265000000), totalCollected: M(12450000000), totalSpent: M(4185000000), interestIncome: M(538225000),
      balanceChangePct: 3.2, collectedChangePct: 8.4, spentChangePct: 12.1,
      bankName: 'Vietcombank', accountNoMasked: '0700-***-4521', interestRate: 6.5, contributionRate: '2% giá trị HĐ',
      collectionRate: 98.6, unitsPaid: 856, unitsTotal: 868,
    },
  });
  const fp = [
    ['2024-Q3', 5200000000, 2000000000], ['2024-Q4', 5800000000, 1200000000], ['2025-Q1', 6300000000, 1600000000],
    ['2025-Q2', 6700000000, 2500000000], ['2025-Q3', 7100000000, 1400000000], ['2025-Q4', 7500000000, 1500000000],
    ['2026-Q1', 7900000000, 2800000000], ['2026-Q2', 8200000000, 1400000000], ['2026-05', 8265000000, 1400000000],
  ];
  await prisma.fundPeriod.createMany({ data: fp.map(([period, bal, cost], i) => ({ buildingId, period: period as string, cumulativeBalance: M(bal as number), maintenanceCost: M(cost as number), sortOrder: i })) });
  await prisma.blockCollection.createMany({
    data: [
      { buildingId, period: '2026-05', block: 'Block A', unitsPaid: 236, unitsTotal: 240 },
      { buildingId, period: '2026-05', block: 'Block B', unitsPaid: 218, unitsTotal: 220 },
      { buildingId, period: '2026-05', block: 'Block C', unitsPaid: 402, unitsTotal: 408 },
    ],
  });
  // Completed maintenance (fund expenses)
  const done = [
    { name: 'Thay thiết bị PCCC', contractor: 'PCCC Sài Gòn', amount: 385002000, d: '2026-05-20' },
    { name: 'Sơn lại hành lang Block B', contractor: 'XD Việt Nam', amount: 124500000, d: '2026-05-12' },
    { name: 'Bảo dưỡng thang máy Otis', contractor: 'OTIS Vietnam', amount: 86800000, d: '2026-05-05' },
    { name: 'Thay bơm nước tầng hầm B1', contractor: 'Cơ điện lạnh BK', amount: 215000000, d: '2026-04-28' },
    { name: 'Sửa hệ thống điện tầng 1–5', contractor: 'Điện lực Sunrise', amount: 54300000, d: '2026-04-15' },
  ];
  for (const j of done) {
    await prisma.maintenanceJob.create({ data: { buildingId, name: j.name, contractor: j.contractor, status: 'COMPLETED', amount: M(j.amount), actualDate: new Date(j.d), fundFinanced: true } });
  }
  // Upcoming plans
  const plans = [
    { name: 'Bảo dưỡng điều hòa trung tâm', contractor: 'Công ty Lạnh Sunshine', period: 'Tháng 6/2026', cost: 320000000, status: 'PLANNED' },
    { name: 'Kiểm tra PCCC định kỳ Q3', contractor: 'PCCC Sài Gòn', period: 'Tháng 7/2026', cost: 45000000, status: 'PLANNED' },
    { name: 'Tổng vệ sinh bể ngầm', contractor: 'Công ty MT Xanh', period: 'Tháng 8/2026', cost: 28500000, status: 'PLANNED' },
    { name: 'Sơn lại mặt tiền tòa nhà', contractor: 'Đang chọn nhà thầu', period: 'Tháng 9/2026', cost: 486000000, status: 'TENTATIVE' },
    { name: 'Nâng cấp hệ thống camera', contractor: 'Đang chọn nhà thầu', period: 'Q4/2026', cost: 210000000, status: 'TENTATIVE' },
  ];
  for (const p of plans) {
    await prisma.maintenanceJob.create({ data: { buildingId, name: p.name, contractor: p.contractor, status: p.status as any, estimatedCost: M(p.cost), scheduledPeriod: p.period, fundFinanced: true } });
  }
}

async function seedOperations(buildingId: string) {
  const wo = [
    { code: '#YC-2605-047', name: 'Thay bóng đèn LED hành lang tầng 12 Block B', category: 'ELECTRICITY', status: 'PROCESSING', priority: 'MEDIUM', requesterName: 'Ban quản trị', requesterInitials: 'BQT', d: '2026-05-24' },
    { code: '#YC-2605-046', name: 'Rò rỉ nước nhà vệ sinh công cộng tầng 3', category: 'WATER', status: 'OVERDUE', priority: 'HIGH', requesterName: 'Nguyễn Thị Lan', requesterInitials: 'NL', overdueDays: 14, d: '2026-05-09' },
    { code: '#YC-2605-045', name: 'Thang máy số 2 Block A phát tiếng ồn lạ', category: 'ELEVATOR', status: 'PROCESSING', priority: 'HIGH', requesterName: 'Trần Văn Khoa', requesterInitials: 'TK', d: '2026-05-23' },
    { code: '#YC-2605-044', name: 'Kiểm tra đầu báo khói tầng hầm B2', category: 'FIRE_SAFETY', status: 'COMPLETED', priority: 'MEDIUM', requesterName: 'Bảo vệ', requesterInitials: 'BV', d: '2026-05-20' },
    { code: '#YC-2605-043', name: 'Vệ sinh khu vực sân chơi trẻ em', category: 'COMMON_AREA', status: 'COMPLETED', priority: 'LOW', requesterName: 'Ban quản trị', requesterInitials: 'BQT', d: '2026-05-18' },
    { code: '#YC-2605-042', name: 'Sửa cửa tự động sảnh chính Block C', category: 'ELECTRICITY', status: 'COMPLETED', priority: 'MEDIUM', requesterName: 'Lê Thị Hà', requesterInitials: 'LH', d: '2026-05-16' },
    { code: '#YC-2605-041', name: 'Tắc cống thoát nước tầng hầm B1', category: 'WATER', status: 'PROCESSING', priority: 'HIGH', requesterName: 'Kỹ thuật', requesterInitials: 'KT', d: '2026-05-22' },
    { code: '#YC-2605-040', name: 'Bảo trì định kỳ máy phát điện dự phòng', category: 'COMMON_AREA', status: 'COMPLETED', priority: 'MEDIUM', requesterName: 'Ban quản trị', requesterInitials: 'BQT', d: '2026-05-14' },
  ];
  for (const w of wo) {
    await prisma.workOrder.create({ data: { buildingId, code: w.code, name: w.name, category: w.category as any, status: w.status as any, priority: w.priority as any, requesterName: w.requesterName, requesterInitials: w.requesterInitials, overdueDays: (w as any).overdueDays, occurredAt: new Date(w.d + 'T09:00:00+07:00') } });
  }
  await prisma.buildingSystem.createMany({
    data: [
      { buildingId, name: 'Hệ thống điện', detail: 'Trạm biến áp & lưới điện', status: 'NORMAL', metric: 'Bình thường', lastCheckedAt: new Date('2026-05-25'), sortOrder: 1 },
      { buildingId, name: 'Hệ thống cấp nước', detail: 'Bơm & bể chứa', status: 'NORMAL', metric: '98%', lastCheckedAt: new Date('2026-05-24'), sortOrder: 2 },
      { buildingId, name: 'Thang máy', detail: '8 thang Otis', status: 'MAINTENANCE', metric: '7/8 hoạt động', lastCheckedAt: new Date('2026-05-23'), sortOrder: 3 },
      { buildingId, name: 'Hệ thống PCCC', detail: 'Báo cháy & chữa cháy', status: 'NORMAL', metric: 'Sẵn sàng', lastCheckedAt: new Date('2026-05-22'), sortOrder: 4 },
      { buildingId, name: 'Camera an ninh', detail: '124 camera', status: 'NORMAL', metric: '122/124', lastCheckedAt: new Date('2026-05-25'), sortOrder: 5 },
      { buildingId, name: 'Máy phát điện dự phòng', detail: '2 máy 500kVA', status: 'NORMAL', metric: 'Sẵn sàng', lastCheckedAt: new Date('2026-05-14'), sortOrder: 6 },
    ],
  });
  // Weekly schedule (scheduledAt set)
  const sched = [
    { name: 'Bảo dưỡng thang máy Block A', contractor: 'OTIS Vietnam', category: 'Thang máy', d: '2026-06-02' },
    { name: 'Kiểm tra hệ thống PCCC tầng hầm', contractor: 'PCCC Sài Gòn', category: 'PCCC', d: '2026-06-03' },
    { name: 'Vệ sinh bể nước sinh hoạt', contractor: 'Công ty MT Xanh', category: 'Nước', d: '2026-06-05' },
    { name: 'Bảo trì máy bơm tầng hầm B2', contractor: 'Cơ điện lạnh BK', category: 'Nước', d: '2026-06-06' },
  ];
  for (const s of sched) {
    await prisma.maintenanceJob.create({ data: { buildingId, name: s.name, contractor: s.contractor, category: s.category, status: 'PLANNED', scheduledAt: new Date(s.d + 'T08:00:00+07:00'), scheduledPeriod: 'Tuần 23', fundFinanced: false } });
  }
}

async function seedKpi(buildingId: string) {
  const trend = [
    { period: '2025-Q1', label: 'Quý 1/2025', score: 70 },
    { period: '2025-Q2', label: 'Quý 2/2025', score: 80 },
    { period: '2025-Q3', label: 'Quý 3/2025', score: 82.5 },
    { period: '2025-Q4', label: 'Quý 4/2025', score: 75 },
    { period: '2026-Q1', label: 'Quý 1/2026', score: 83.2 },
  ];
  for (const t of trend) {
    await prisma.kpiPeriod.create({ data: { buildingId, period: t.period, periodLabel: t.label, totalScore: t.score, grade: t.score >= 85 ? 'EXCELLENT' : t.score >= 70 ? 'GOOD' : 'NEEDS_IMPROVEMENT', targetScore: 85 } });
  }
  const cats = [
    { name: 'Tài chính', color: '#1c9d5f', score: 91, passed: 5, total: 5, grade: 'EXCELLENT', metrics: [
      { name: 'Tỉ lệ thu phí quản lý', unit: '% căn hộ đóng đúng hạn', target: '≥ 95%', actual: '98.6%', statusColor: 'green', ach: 103.8, pe: 20, pm: 20, badge: 'EXCEEDED' },
      { name: 'Tỉ lệ chi/thu', unit: '%', target: '≤ 80%', actual: '75.2%', statusColor: 'green', ach: 106.4, pe: 18, pm: 18, badge: 'EXCEEDED' },
      { name: 'Minh bạch báo cáo', unit: 'báo cáo/quý', target: '3', actual: '3', statusColor: 'green', ach: 100, pe: 15, pm: 15, badge: 'ACHIEVED' },
    ] },
    { name: 'Vận hành', color: '#4137f9', score: 88, passed: 4, total: 5, grade: 'GOOD', metrics: [
      { name: 'Thời gian xử lý yêu cầu', unit: 'giờ trung bình', target: '≤ 24h', actual: '20h', statusColor: 'green', ach: 110, pe: 18, pm: 18, badge: 'EXCEEDED' },
      { name: 'Tỉ lệ hoàn thành đúng hạn', unit: '%', target: '≥ 90%', actual: '87%', statusColor: 'orange', ach: 96.7, pe: 14, pm: 16, badge: 'ACHIEVED' },
    ] },
    { name: 'Dịch vụ cư dân', color: '#7a6dff', score: 85, passed: 4, total: 5, grade: 'GOOD', metrics: [
      { name: 'Mức độ hài lòng cư dân', unit: '/5 sao', target: '≥ 4.0', actual: '4.3', statusColor: 'green', ach: 107.5, pe: 17, pm: 17, badge: 'EXCEEDED' },
      { name: 'Tỉ lệ phản hồi góp ý', unit: '%', target: '≥ 95%', actual: '92%', statusColor: 'orange', ach: 96.8, pe: 13, pm: 15, badge: 'ACHIEVED' },
    ] },
    { name: 'An ninh & PCCC', color: '#ef6b7c', score: 86, passed: 4, total: 5, grade: 'GOOD', metrics: [
      { name: 'Sự cố an ninh', unit: 'vụ/quý', target: '0', actual: '0', statusColor: 'green', ach: 100, pe: 20, pm: 20, badge: 'ACHIEVED' },
      { name: 'Kiểm tra PCCC định kỳ', unit: 'lần/quý', target: '3', actual: '2', statusColor: 'orange', ach: 66.7, pe: 10, pm: 15, badge: 'NEEDS_IMPROVEMENT' },
    ] },
    { name: 'Bảo trì hạ tầng', color: '#ff9d6a', score: 84, passed: 3, total: 4, grade: 'GOOD', metrics: [
      { name: 'Tỉ lệ thiết bị hoạt động', unit: '%', target: '≥ 95%', actual: '96%', statusColor: 'green', ach: 101, pe: 16, pm: 16, badge: 'EXCEEDED' },
      { name: 'Bảo trì phòng ngừa đúng kế hoạch', unit: '%', target: '≥ 90%', actual: '85%', statusColor: 'orange', ach: 94.4, pe: 12, pm: 14, badge: 'ACHIEVED' },
    ] },
  ];
  await prisma.kpiPeriod.create({
    data: {
      buildingId, period: '2026-Q2', periodLabel: 'Quý 2/2026', totalScore: 87.4, grade: 'EXCELLENT', targetScore: 85, scoreChange: 4.2, comparisonPeriod: 'Quý 1',
      achievedCount: 18, needsImprovementCount: 4, notAchievedCount: 2, totalMetrics: 24,
      categories: {
        create: cats.map((c, ci) => ({
          name: c.name, color: c.color, score: c.score, metricsPassed: c.passed, metricsTotal: c.total, grade: c.grade as any, sortOrder: ci,
          metrics: { create: c.metrics.map((m, mi) => ({ name: m.name, unit: m.unit, targetValue: m.target, actualValue: m.actual, statusColor: m.statusColor, achievementPct: m.ach, pointsEarned: m.pe, pointsMax: m.pm, resultBadge: m.badge as any, sortOrder: mi })) },
        })),
      },
    },
  });
  await prisma.boardMember.createMany({
    data: [
      { buildingId, name: 'Ông Nguyễn Thanh Bình', initials: 'NB', role: 'Chủ tịch BQT', score: 92, grade: 'EXCELLENT', termStart: 2023, termEnd: 2026, avatarColor: '#4137f9', sortOrder: 1 },
      { buildingId, name: 'Bà Trần Thị Lan Anh', initials: 'LA', role: 'Phó Chủ tịch BQT', score: 89, grade: 'GOOD', termStart: 2023, termEnd: 2026, avatarColor: '#1c9d5f', sortOrder: 2 },
      { buildingId, name: 'Ông Lê Minh Hoàng', initials: 'MH', role: 'Uỷ viên Tài chính', score: 90, grade: 'EXCELLENT', termStart: 2023, termEnd: 2026, avatarColor: '#7a6dff', sortOrder: 3 },
      { buildingId, name: 'Ông Phạm Văn Đức', initials: 'VD', role: 'Uỷ viên Kỹ thuật', score: 85, grade: 'GOOD', termStart: 2023, termEnd: 2026, avatarColor: '#ff9d6a', sortOrder: 4 },
      { buildingId, name: 'Bà Vũ Thị Mai', initials: 'VM', role: 'Uỷ viên An ninh', score: 83, grade: 'GOOD', termStart: 2023, termEnd: 2026, avatarColor: '#ef6b7c', sortOrder: 5 },
    ],
  });
}

async function seedReports(buildingId: string) {
  const pub = (title: string, periodType: any, periodLabel: string, category: any, fileType: any, size: number, views: number, d: string) =>
    ({ buildingId, title, periodType, periodLabel, status: 'PUBLISHED' as any, category, fileType, sizeBytes: size, url: `https://172.104.188.44:9000/nhachung/reports/${encodeURIComponent(title)}.pdf`, viewCount: views, publishedAt: new Date(d) });
  await prisma.report.createMany({
    data: [
      pub('Báo cáo hoạt động BQT tháng 4/2026', 'MONTH', 'Tháng 4/2026', 'BOARD', 'PDF', 2516582, 247, '2026-05-08'),
      pub('Báo cáo hoạt động BQT tháng 3/2026', 'MONTH', 'Tháng 3/2026', 'BOARD', 'PDF', 2202009, 312, '2026-04-05'),
      pub('Báo cáo hoạt động BQT tháng 2/2026', 'MONTH', 'Tháng 2/2026', 'BOARD', 'DOCX', 1887436, 198, '2026-03-07'),
      pub('Báo cáo hoạt động BQT tháng 1/2026', 'MONTH', 'Tháng 1/2026', 'BOARD', 'PDF', 2306867, 276, '2026-02-06'),
      pub('Báo cáo tổng hợp Quý 1/2026', 'QUARTER', 'Quý 1/2026', 'BOARD', 'PDF', 6081740, 531, '2026-04-15'),
      pub('Báo cáo thường niên BQT năm 2025', 'YEAR', '2025', 'BOARD', 'PDF', 12897484, 892, '2026-01-20'),
      pub('Báo cáo tài chính tháng 4/2026', 'MONTH', 'Tháng 4/2026', 'FINANCE', 'PDF', 2516582, 256, '2026-05-01'),
    ],
  });
  // Pending / draft (upcoming deadlines)
  await prisma.report.createMany({
    data: [
      { buildingId, title: 'Báo cáo hoạt động BQT tháng 5/2026', periodType: 'MONTH', periodLabel: 'Tháng 5/2026', status: 'PENDING', category: 'BOARD', fileType: 'PDF', responsibleName: 'Ô. Nguyễn Thanh Bình', dueDate: new Date('2026-06-10') },
      { buildingId, title: 'Báo cáo tài chính Quý 2/2026', periodType: 'QUARTER', periodLabel: 'Quý 2/2026', status: 'PENDING', category: 'FINANCE', fileType: 'XLSX', responsibleName: 'Bà Trần Thị Lan Anh', dueDate: new Date('2026-07-15') },
      { buildingId, title: 'Báo cáo tháng 6/2026', periodType: 'MONTH', periodLabel: 'Tháng 6/2026', status: 'DRAFT', category: 'BOARD', responsibleName: 'Ô. Nguyễn Thanh Bình', dueDate: new Date('2026-07-10') },
    ],
  });
}

async function seedArchive(buildingId: string, accountId: string) {
  const doc = (name: string, fileType: any, cat: any, size: number, downloads: number, d: string) =>
    ({ buildingId, name, fileType, archiveCategory: cat, sizeBytes: size, downloadCount: downloads, uploadedById: accountId, url: `https://172.104.188.44:9000/nhachung/archive/${encodeURIComponent(name)}`, createdAt: new Date(d) });
  await prisma.document.createMany({
    data: [
      doc('Biên bản họp BQT tháng 5/2026', 'PDF', 'BOARD', 1258291, 47, '2026-05-22'),
      doc('Báo cáo tài chính tháng 5/2026', 'PDF', 'FINANCE', 2516582, 89, '2026-05-20'),
      doc('Kế hoạch vận hành Quý 2/2026', 'DOCX', 'OPERATIONS', 891289, 34, '2026-05-15'),
      doc('Biên bản kiểm tra PCCC tháng 5', 'PDF', 'SECURITY', 1572864, 28, '2026-05-10'),
      doc('Hợp đồng bảo trì thang máy 2026', 'PDF', 'MAINTENANCE', 2097152, 19, '2026-05-05'),
      doc('Biên bản họp BQT tháng 4/2026', 'PDF', 'BOARD', 1310720, 63, '2026-04-21'),
      doc('Báo cáo tài chính tháng 4/2026', 'PDF', 'FINANCE', 2411724, 102, '2026-04-08'),
      doc('Quy định sử dụng tiện ích chung 2026', 'DOCX', 'OPERATIONS', 655360, 145, '2026-03-18'),
      doc('Báo cáo tổng hợp Quý 1/2026', 'PDF', 'BOARD', 6081740, 531, '2026-04-15'),
      doc('Bảng kê chi phí vận hành Q1/2026', 'XLSX', 'FINANCE', 194560, 76, '2026-04-10'),
      doc('Báo cáo thường niên 2025', 'PDF', 'BOARD', 12897484, 892, '2026-01-20'),
      doc('Biên bản bàn giao hệ thống camera', 'PDF', 'SECURITY', 1048576, 41, '2025-12-12'),
      doc('Hợp đồng dịch vụ vệ sinh 2025', 'DOCX', 'OPERATIONS', 786432, 33, '2025-11-08'),
      doc('Báo cáo bảo trì hạ tầng năm 2025', 'PDF', 'MAINTENANCE', 3145728, 58, '2025-10-15'),
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
