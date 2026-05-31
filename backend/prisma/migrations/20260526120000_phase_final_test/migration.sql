-- AlterTable
ALTER TABLE "additional_user_data" ADD COLUMN IF NOT EXISTS "phase_final_test_draft" JSONB;
ALTER TABLE "additional_user_data" ADD COLUMN IF NOT EXISTS "phase_final_test_progress" JSONB;
