import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { AdminResidentsController } from './residents/residents.controller';
import { AdminResidentsService } from './residents/residents.service';
import { AdminFeesController } from './fees/fees.controller';
import { AdminFeesService } from './fees/fees.service';
import { AdminNotificationsController } from './notifications/notifications.controller';
import { AdminNotificationsService } from './notifications/notifications.service';
import { AdminFeedbacksController } from './feedbacks/feedbacks.controller';
import { AdminFeedbacksService } from './feedbacks/feedbacks.service';
import { AdminDocumentsController } from './documents/documents.controller';
import { AdminDocumentsService } from './documents/documents.service';
import { AdminOperationsController } from './operations/operations.controller';
import { AdminOperationsService } from './operations/operations.service';
import { AdminTransactionsController } from './transactions/transactions.controller';
import { AdminTransactionsService } from './transactions/transactions.service';
import { AdminFundController } from './fund/fund.controller';
import { AdminFundService } from './fund/fund.service';
import { AdminApartmentsController } from './apartments/apartments.controller';
import { AdminApartmentsService } from './apartments/apartments.service';
import { AdminRolesController, AdminRolesService } from './roles/roles';
import {
  AdminDashboardController,
  AdminDashboardService,
} from './dashboard/dashboard';
import { AdminReportsController, AdminReportsService } from './reports/reports';
import {
  AdminSettingsController,
  AdminSettingsService,
} from './settings/settings';

/**
 * Building-management (admin) API surface. Every route is guarded by
 * `@Roles()` (RolesGuard), which resolves the admin's building and scopes all
 * data to it via the `@AdminBuilding()` decorator.
 */
@Module({
  imports: [StorageModule],
  controllers: [
    AdminResidentsController,
    AdminFeesController,
    AdminNotificationsController,
    AdminFeedbacksController,
    AdminDocumentsController,
    AdminOperationsController,
    AdminTransactionsController,
    AdminFundController,
    AdminApartmentsController,
    AdminRolesController,
    AdminDashboardController,
    AdminReportsController,
    AdminSettingsController,
  ],
  providers: [
    AdminResidentsService,
    AdminFeesService,
    AdminNotificationsService,
    AdminFeedbacksService,
    AdminDocumentsService,
    AdminOperationsService,
    AdminTransactionsService,
    AdminFundService,
    AdminApartmentsService,
    AdminRolesService,
    AdminDashboardService,
    AdminReportsService,
    AdminSettingsService,
  ],
})
export class AdminModule {}
