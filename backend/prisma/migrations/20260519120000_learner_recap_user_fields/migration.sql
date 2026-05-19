-- Learner recap / training hub fields on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "comprehension_wrong_bank" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "error_fixing_test_pending" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "weekly_review_completed_week_start" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "weekly_review_last_score_pct" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "monthly_review_completed_month" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "monthly_review_last_score_pct" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mistakes_practice_completed_at" TIMESTAMP(3);
