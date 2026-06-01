-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('UP', 'DOWN', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "LineItemKind" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "WorkOrderCategory" AS ENUM ('ELECTRICITY', 'WATER', 'ELEVATOR', 'FIRE_SAFETY', 'COMMON_AREA', 'OTHER');

-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('NORMAL', 'MAINTENANCE', 'WARNING');

-- CreateEnum
CREATE TYPE "MaintenanceJobStatus" AS ENUM ('COMPLETED', 'IN_PROGRESS', 'PLANNED', 'TENTATIVE');

-- CreateEnum
CREATE TYPE "KpiGrade" AS ENUM ('EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT');

-- CreateEnum
CREATE TYPE "KpiResultBadge" AS ENUM ('EXCEEDED', 'ACHIEVED', 'NEEDS_IMPROVEMENT');

-- CreateEnum
CREATE TYPE "ReportPeriodType" AS ENUM ('MONTH', 'QUARTER', 'YEAR');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ArchiveCategory" AS ENUM ('FINANCE', 'OPERATIONS', 'SECURITY', 'BOARD', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "archive_category" "ArchiveCategory",
ADD COLUMN     "download_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uploaded_by_id" TEXT;

-- CreateTable
CREATE TABLE "financial_periods" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "total_income" BIGINT NOT NULL,
    "total_expense" BIGINT NOT NULL,
    "surplus" BIGINT NOT NULL,
    "income_change_pct" DOUBLE PRECISION,
    "expense_change_pct" DOUBLE PRECISION,
    "surplus_change_pct" DOUBLE PRECISION,
    "collection_rate" DOUBLE PRECISION,
    "expense_ratio" DOUBLE PRECISION,
    "fund_usage_rate" DOUBLE PRECISION,
    "collection_rate_change_pct" DOUBLE PRECISION,
    "expense_ratio_change_pct" DOUBLE PRECISION,
    "units_paid" INTEGER,
    "units_total" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_line_items" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "kind" "LineItemKind" NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "amount" BIGINT NOT NULL,
    "pct_of_total" DOUBLE PRECISION NOT NULL,
    "comparison_pct" DOUBLE PRECISION,
    "comparison_direction" "TrendDirection",
    "sub_info" TEXT,
    "color" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "financial_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sub_info" TEXT,
    "vendor_name" TEXT,
    "contract_ref" TEXT,
    "payment_method" TEXT,
    "amount" BIGINT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_funds" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "balance" BIGINT NOT NULL,
    "total_collected" BIGINT NOT NULL,
    "total_spent" BIGINT NOT NULL,
    "interest_income" BIGINT NOT NULL,
    "balance_change_pct" DOUBLE PRECISION,
    "collected_change_pct" DOUBLE PRECISION,
    "spent_change_pct" DOUBLE PRECISION,
    "bank_name" TEXT,
    "account_no_masked" TEXT,
    "interest_rate" DOUBLE PRECISION,
    "contribution_rate" TEXT,
    "collection_rate" DOUBLE PRECISION,
    "units_paid" INTEGER,
    "units_total" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_periods" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "cumulative_balance" BIGINT NOT NULL,
    "maintenance_cost" BIGINT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "fund_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_collections" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "units_paid" INTEGER NOT NULL,
    "units_total" INTEGER NOT NULL,

    CONSTRAINT "block_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_jobs" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "contractor" TEXT,
    "status" "MaintenanceJobStatus" NOT NULL,
    "amount" BIGINT,
    "estimated_cost" BIGINT,
    "scheduled_period" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "actual_date" TIMESTAMP(3),
    "fund_financed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "WorkOrderCategory" NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'PROCESSING',
    "priority" "WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
    "requester_name" TEXT,
    "requester_initials" TEXT,
    "overdue_days" INTEGER,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building_systems" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "status" "SystemStatus" NOT NULL DEFAULT 'NORMAL',
    "metric" TEXT,
    "last_checked_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "building_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_periods" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "period_label" TEXT NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "grade" "KpiGrade" NOT NULL,
    "target_score" DOUBLE PRECISION NOT NULL,
    "score_change" DOUBLE PRECISION,
    "comparison_period" TEXT,
    "achieved_count" INTEGER NOT NULL DEFAULT 0,
    "needs_improvement_count" INTEGER NOT NULL DEFAULT 0,
    "not_achieved_count" INTEGER NOT NULL DEFAULT 0,
    "total_metrics" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_categories" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "metrics_passed" INTEGER NOT NULL,
    "metrics_total" INTEGER NOT NULL,
    "grade" "KpiGrade" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "kpi_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_metrics" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "target_value" TEXT,
    "actual_value" TEXT,
    "status_color" TEXT,
    "achievement_pct" DOUBLE PRECISION,
    "points_earned" DOUBLE PRECISION,
    "points_max" DOUBLE PRECISION,
    "result_badge" "KpiResultBadge",
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "kpi_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT,
    "role" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "grade" "KpiGrade",
    "term_start" INTEGER,
    "term_end" INTEGER,
    "avatar_color" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "period_type" "ReportPeriodType" NOT NULL,
    "period_label" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "category" "ArchiveCategory",
    "file_type" "DocumentFileType",
    "size_bytes" INTEGER,
    "url" TEXT,
    "responsible_name" TEXT,
    "due_date" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_periods_building_id_period_key" ON "financial_periods"("building_id", "period");

-- CreateIndex
CREATE INDEX "financial_line_items_period_id_kind_idx" ON "financial_line_items"("period_id", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_code_key" ON "transactions"("code");

-- CreateIndex
CREATE INDEX "transactions_building_id_occurred_at_idx" ON "transactions"("building_id", "occurred_at");

-- CreateIndex
CREATE INDEX "transactions_building_id_type_idx" ON "transactions"("building_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_funds_building_id_key" ON "maintenance_funds"("building_id");

-- CreateIndex
CREATE UNIQUE INDEX "fund_periods_building_id_period_key" ON "fund_periods"("building_id", "period");

-- CreateIndex
CREATE INDEX "block_collections_building_id_period_idx" ON "block_collections"("building_id", "period");

-- CreateIndex
CREATE INDEX "maintenance_jobs_building_id_status_idx" ON "maintenance_jobs"("building_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_code_key" ON "work_orders"("code");

-- CreateIndex
CREATE INDEX "work_orders_building_id_status_idx" ON "work_orders"("building_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_periods_building_id_period_key" ON "kpi_periods"("building_id", "period");

-- CreateIndex
CREATE INDEX "kpi_categories_period_id_idx" ON "kpi_categories"("period_id");

-- CreateIndex
CREATE INDEX "kpi_metrics_category_id_idx" ON "kpi_metrics"("category_id");

-- CreateIndex
CREATE INDEX "board_members_building_id_idx" ON "board_members"("building_id");

-- CreateIndex
CREATE INDEX "reports_building_id_period_type_idx" ON "reports"("building_id", "period_type");

-- CreateIndex
CREATE INDEX "reports_building_id_status_idx" ON "reports"("building_id", "status");

-- CreateIndex
CREATE INDEX "documents_building_id_archive_category_idx" ON "documents"("building_id", "archive_category");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_periods" ADD CONSTRAINT "financial_periods_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_line_items" ADD CONSTRAINT "financial_line_items_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "financial_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_funds" ADD CONSTRAINT "maintenance_funds_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_periods" ADD CONSTRAINT "fund_periods_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_collections" ADD CONSTRAINT "block_collections_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building_systems" ADD CONSTRAINT "building_systems_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_periods" ADD CONSTRAINT "kpi_periods_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_categories" ADD CONSTRAINT "kpi_categories_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "kpi_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_metrics" ADD CONSTRAINT "kpi_metrics_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "kpi_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
