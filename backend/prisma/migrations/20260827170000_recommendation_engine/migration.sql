CREATE TABLE "learner_engine_profiles" (
    "user_id" INTEGER NOT NULL,
    "proficiency_level" INTEGER NOT NULL DEFAULT 2,
    "interests_vector" DOUBLE PRECISION[] NOT NULL DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "target_accent" TEXT NOT NULL DEFAULT 'general-american',
    "known_words" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "learner_engine_profiles_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "user_word_memories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "memory_strength" DOUBLE PRECISION NOT NULL DEFAULT 2.0,

    CONSTRAINT "user_word_memories_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "video_segments" ADD COLUMN "proficiency_level" INTEGER;
ALTER TABLE "video_segments" ADD COLUMN "context_vector" DOUBLE PRECISION[] NOT NULL DEFAULT ARRAY[]::DOUBLE PRECISION[];
ALTER TABLE "video_segments" ADD COLUMN "accent" TEXT NOT NULL DEFAULT 'general-american';
ALTER TABLE "video_segments" ADD COLUMN "words" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE UNIQUE INDEX "user_word_memories_user_id_word_key" ON "user_word_memories"("user_id", "word");
CREATE INDEX "user_word_memories_user_id_idx" ON "user_word_memories"("user_id");
CREATE INDEX "video_segments_words_gin_idx" ON "video_segments" USING GIN ("words");
CREATE INDEX "learner_engine_profiles_known_words_gin_idx" ON "learner_engine_profiles" USING GIN ("known_words");

ALTER TABLE "learner_engine_profiles" ADD CONSTRAINT "learner_engine_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_word_memories" ADD CONSTRAINT "user_word_memories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "learner_engine_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learner_engine_profiles" ADD CONSTRAINT "learner_engine_profiles_proficiency_level_check" CHECK ("proficiency_level" >= 1 AND "proficiency_level" <= 6);
ALTER TABLE "video_segments" ADD CONSTRAINT "video_segments_proficiency_level_check" CHECK ("proficiency_level" IS NULL OR ("proficiency_level" >= 1 AND "proficiency_level" <= 6));
