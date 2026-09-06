-- AlterTable
ALTER TABLE "constellations" ADD COLUMN "kind" TEXT;

-- CreateIndex
CREATE INDEX "constellations_user_id_kind_idx" ON "constellations"("user_id", "kind");
