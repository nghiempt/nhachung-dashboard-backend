-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('CCCD', 'CMND', 'PASSPORT', 'BIRTH_CERTIFICATE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'PENDING', 'MISSING');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORBIKE', 'BICYCLE', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('URGENT', 'MAINTENANCE', 'FINANCE', 'EVENT', 'COMMUNITY', 'ANNOUNCEMENT', 'SECURITY');

-- CreateEnum
CREATE TYPE "NotificationIconType" AS ENUM ('WARNING', 'INFO', 'LIGHTNING', 'DOCUMENT', 'CALENDAR', 'SHIELD', 'BELL');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('PDF', 'DOC', 'XLS', 'IMG');

-- CreateEnum
CREATE TYPE "DocumentFileType" AS ENUM ('PDF', 'DOCX', 'XLSX', 'PPTX', 'IMG', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('PROCESSING', 'AWAITING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ANNOUNCEMENT', 'EVENT', 'MAINTENANCE', 'COMMUNITY', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('FEEDBACK', 'SERVICE', 'DOCUMENT', 'NOTIFICATION', 'PAYMENT', 'OTHER');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "company_name" TEXT,
    "full_name" TEXT NOT NULL,
    "referral_code" TEXT,
    "profile_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_profiles" (
    "id" TEXT NOT NULL,
    "avatar_url" TEXT,
    "full_name" TEXT NOT NULL,
    "display_name" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" "Gender",
    "nationality" TEXT,
    "occupation" TEXT,
    "permanent_address" TEXT,
    "location" TEXT,
    "is_verified_resident" BOOLEAN NOT NULL DEFAULT false,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "id_type" "IdType",
    "id_number" TEXT,
    "id_verified" BOOLEAN NOT NULL DEFAULT false,
    "id_issue_date" TIMESTAMP(3),
    "id_issue_location" TEXT,
    "id_front_url" TEXT,
    "id_back_url" TEXT,
    "phone_number" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "secondary_phone" TEXT,
    "email" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "zalo_number" TEXT,
    "zalo_linked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT,
    "member_id" TEXT,
    "vehicle_name" TEXT,
    "license_plate" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "parking_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "relationship" TEXT,
    "location" TEXT,
    "phone_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'OTHER',
    "text" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "device_name" TEXT,
    "device_os" TEXT,
    "user_agent" TEXT,
    "ip" TEXT,
    "location" TEXT,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_settings" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'vi',
    "theme" "Theme" NOT NULL DEFAULT 'LIGHT',
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "password_changed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_notification_settings" (
    "id" TEXT NOT NULL,
    "settings_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "account_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "location" TEXT,
    "address" TEXT,
    "thumbnail_url" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_buildings" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "apartment_id" TEXT,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'resident',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartments" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "block" TEXT,
    "floor" INTEGER,
    "total_floors" INTEGER,
    "area_sqm" DOUBLE PRECISION,
    "total_area_sqm" DOUBLE PRECISION,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "balconies" INTEGER,
    "orientation" TEXT,
    "furnishing_status" TEXT,
    "ownership_type" TEXT,
    "parking_locations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "move_in_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apartments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartment_contracts" (
    "id" TEXT NOT NULL,
    "apartment_id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "ownership_type" TEXT,
    "contract_date" TIMESTAMP(3),
    "handover_date" TIMESTAMP(3),
    "owner_name" TEXT,
    "registration_status" TEXT,
    "document_url" TEXT,

    CONSTRAINT "apartment_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apartment_fees" (
    "id" TEXT NOT NULL,
    "apartment_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "apartment_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "apartment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" TEXT,
    "gender" "Gender",
    "date_of_birth" TIMESTAMP(3),
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "phone_number" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "contact_type" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_member_documents" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "type" "IdType" NOT NULL,
    "number" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "file_url" TEXT,

    CONSTRAINT "family_member_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "eyebrow" TEXT,
    "title" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "icon_type" "NotificationIconType" NOT NULL DEFAULT 'BELL',
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT,
    "author_name" TEXT,
    "author_role" TEXT,
    "author_verified" BOOLEAN NOT NULL DEFAULT true,
    "body" JSONB,
    "time_card" JSONB,
    "checklist" JSONB,
    "alert_text" TEXT,
    "signoff" JSONB,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_attachments" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL DEFAULT 'PDF',
    "size_bytes" INTEGER,
    "url" TEXT NOT NULL,

    CONSTRAINT "notification_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_reads" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "file_type" "DocumentFileType" NOT NULL DEFAULT 'PDF',
    "size_bytes" INTEGER,
    "url" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "account_id" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
    "location" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_images" (
    "id" TEXT NOT NULL,
    "feedback_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "feedback_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_history" (
    "id" TEXT NOT NULL,
    "feedback_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "status" "FeedbackStatus",
    "actor_name" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "thumbnail_url" TEXT,
    "category" "NewsCategory" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "tags" JSONB,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "read_minutes" INTEGER,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT,
    "author_name" TEXT,
    "author_label" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "location" TEXT,
    "regulations" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "thumbnail_url" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_profile_id_key" ON "accounts"("profile_id");

-- CreateIndex
CREATE INDEX "activity_logs_account_id_idx" ON "activity_logs"("account_id");

-- CreateIndex
CREATE INDEX "sessions_account_id_idx" ON "sessions"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_settings_account_id_key" ON "account_settings"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_notification_settings_settings_id_key_key" ON "account_notification_settings"("settings_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_slug_key" ON "buildings"("slug");

-- CreateIndex
CREATE INDEX "account_buildings_building_id_idx" ON "account_buildings"("building_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_buildings_account_id_building_id_key" ON "account_buildings"("account_id", "building_id");

-- CreateIndex
CREATE UNIQUE INDEX "apartments_building_id_code_key" ON "apartments"("building_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "apartment_contracts_apartment_id_key" ON "apartment_contracts"("apartment_id");

-- CreateIndex
CREATE INDEX "apartment_fees_apartment_id_period_idx" ON "apartment_fees"("apartment_id", "period");

-- CreateIndex
CREATE INDEX "family_members_apartment_id_idx" ON "family_members"("apartment_id");

-- CreateIndex
CREATE INDEX "notifications_building_id_category_idx" ON "notifications"("building_id", "category");

-- CreateIndex
CREATE INDEX "notifications_building_id_is_urgent_idx" ON "notifications"("building_id", "is_urgent");

-- CreateIndex
CREATE INDEX "notification_reads_account_id_idx" ON "notification_reads"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_reads_notification_id_account_id_key" ON "notification_reads"("notification_id", "account_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_building_id_name_key" ON "document_categories"("building_id", "name");

-- CreateIndex
CREATE INDEX "documents_building_id_category_id_idx" ON "documents"("building_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_code_key" ON "feedbacks"("code");

-- CreateIndex
CREATE INDEX "feedbacks_building_id_status_idx" ON "feedbacks"("building_id", "status");

-- CreateIndex
CREATE INDEX "feedback_history_feedback_id_idx" ON "feedback_history"("feedback_id");

-- CreateIndex
CREATE INDEX "news_building_id_category_idx" ON "news"("building_id", "category");

-- CreateIndex
CREATE INDEX "events_building_id_start_at_idx" ON "events"("building_id", "start_at");

-- CreateIndex
CREATE INDEX "community_posts_building_id_idx" ON "community_posts"("building_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "account_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "account_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "account_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_settings" ADD CONSTRAINT "account_settings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_notification_settings" ADD CONSTRAINT "account_notification_settings_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "account_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_buildings" ADD CONSTRAINT "account_buildings_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_buildings" ADD CONSTRAINT "account_buildings_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_buildings" ADD CONSTRAINT "account_buildings_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartment_contracts" ADD CONSTRAINT "apartment_contracts_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartment_fees" ADD CONSTRAINT "apartment_fees_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_member_documents" ADD CONSTRAINT "family_member_documents_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_attachments" ADD CONSTRAINT "notification_attachments_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_categories" ADD CONSTRAINT "document_categories_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "document_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_images" ADD CONSTRAINT "feedback_images_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_history" ADD CONSTRAINT "feedback_history_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
