import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { CommonModule } from './common/common.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BuildingsModule } from './buildings/buildings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DocumentsModule } from './documents/documents.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { CommunityModule } from './community/community.module';
import { ProfileModule } from './profile/profile.module';
import { FamilyModule } from './family/family.module';
import { ApartmentModule } from './apartment/apartment.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';
import { FinancialModule } from './financial/financial.module';
import { FundModule } from './fund/fund.module';
import { KpiModule } from './kpi/kpi.module';
import { ReportsModule } from './reports/reports.module';
import { OperationsModule } from './operations/operations.module';
import { ArchiveModule } from './archive/archive.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    CommonModule,
    AuthModule,
    BuildingsModule,
    DashboardModule,
    NotificationsModule,
    DocumentsModule,
    FeedbacksModule,
    NewsModule,
    EventsModule,
    CommunityModule,
    ProfileModule,
    FamilyModule,
    ApartmentModule,
    SettingsModule,
    UploadsModule,
    FinancialModule,
    FundModule,
    KpiModule,
    ReportsModule,
    OperationsModule,
    ArchiveModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
