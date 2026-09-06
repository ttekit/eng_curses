-- CreateTable
CREATE TABLE "video_segments" (
    "id" SERIAL NOT NULL,
    "content_video_id" INTEGER NOT NULL,
    "start_time_sec" DOUBLE PRECISION NOT NULL,
    "end_time_sec" DOUBLE PRECISION NOT NULL,
    "full_phrase" TEXT NOT NULL,
    "difficulty_level" TEXT,
    "cue_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lemmas" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "base_language" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "lemmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segment_lemmas" (
    "segment_id" INTEGER NOT NULL,
    "lemma_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "segment_lemmas_pkey" PRIMARY KEY ("segment_id","lemma_id","position")
);

-- CreateTable
CREATE TABLE "user_lemma_progress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lemma_id" INTEGER NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "retrievability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "last_reviewed_at" TIMESTAMP(3),
    "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "lapse_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_lemma_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_segment_seen" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "segment_id" INTEGER NOT NULL,
    "seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_segment_seen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_segments_content_video_id_idx" ON "video_segments"("content_video_id");

-- CreateIndex
CREATE INDEX "video_segments_difficulty_level_idx" ON "video_segments"("difficulty_level");

-- CreateIndex
CREATE UNIQUE INDEX "video_segments_content_video_id_cue_index_key" ON "video_segments"("content_video_id", "cue_index");

-- CreateIndex
CREATE UNIQUE INDEX "lemmas_word_base_language_key" ON "lemmas"("word", "base_language");

-- CreateIndex
CREATE INDEX "segment_lemmas_lemma_id_idx" ON "segment_lemmas"("lemma_id");

-- CreateIndex
CREATE INDEX "user_lemma_progress_user_id_next_review_at_idx" ON "user_lemma_progress"("user_id", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_lemma_progress_user_id_lemma_id_key" ON "user_lemma_progress"("user_id", "lemma_id");

-- CreateIndex
CREATE INDEX "user_segment_seen_user_id_seen_at_idx" ON "user_segment_seen"("user_id", "seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_segment_seen_user_id_segment_id_key" ON "user_segment_seen"("user_id", "segment_id");

-- AddForeignKey
ALTER TABLE "video_segments" ADD CONSTRAINT "video_segments_content_video_id_fkey" FOREIGN KEY ("content_video_id") REFERENCES "content_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_lemmas" ADD CONSTRAINT "segment_lemmas_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "video_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_lemmas" ADD CONSTRAINT "segment_lemmas_lemma_id_fkey" FOREIGN KEY ("lemma_id") REFERENCES "lemmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lemma_progress" ADD CONSTRAINT "user_lemma_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lemma_progress" ADD CONSTRAINT "user_lemma_progress_lemma_id_fkey" FOREIGN KEY ("lemma_id") REFERENCES "lemmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_segment_seen" ADD CONSTRAINT "user_segment_seen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_segment_seen" ADD CONSTRAINT "user_segment_seen_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "video_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
