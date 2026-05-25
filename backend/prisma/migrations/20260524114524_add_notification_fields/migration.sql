-- AlterEnum
ALTER TYPE "TokenType" ADD VALUE 'ACCOUNT_RESTORE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "daily_reminder_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deletion_scheduled_at" TIMESTAMP(3),
ADD COLUMN     "weekly_report_enabled" BOOLEAN NOT NULL DEFAULT true;
