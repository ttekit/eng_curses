/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `method` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REGULAR', 'STUDENT', 'TEACHER', 'ADULT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('CREDENTIALS', 'GOOGLE');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('VERIFICATION', 'TWO_FACTOR', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "content_videos" ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_two_factor_enable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "method" "AuthMethod" NOT NULL,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "password" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'REGULAR';

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expiresIn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_email_key" ON "tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "user_comprehension_weak_spots_user_id_content_video_id_last_mis" RENAME TO "user_comprehension_weak_spots_user_id_content_video_id_last_idx";

-- RenameIndex
ALTER INDEX "user_comprehension_weak_spots_user_id_content_video_id_stem_has" RENAME TO "user_comprehension_weak_spots_user_id_content_video_id_stem_key";
