import { Prisma } from "@generated/prisma/client";
import type { PrismaService } from "src/prisma.service";
import type { FeedMode, SegmentCandidateRow } from "./recommendation.types";
import { feed_min_duration_clause } from "./segment-duration.util";

export async function fetch_review_candidates(
  prisma: PrismaService,
  input: {
    knownUnion: string[];
    learningWords: string[];
    excludeIds: number[];
    limit: number;
  },
): Promise<SegmentCandidateRow[]> {
  const excludeClause =
    input.excludeIds.length > 0
      ? Prisma.sql`AND vs.id NOT IN (${Prisma.join(input.excludeIds)})`
      : Prisma.empty;
  return prisma.$queryRaw<SegmentCandidateRow[]>(Prisma.sql`
    SELECT
      vs.id,
      vs.content_video_id,
      vs.start_time_sec,
      vs.end_time_sec,
      vs.full_phrase,
      vs.proficiency_level,
      vs.accent,
      vs.words,
      0::float AS cos_sim
    FROM video_segments vs
    WHERE vs.words <@ ${input.knownUnion}::text[]
      AND vs.words && ${input.learningWords}::text[]
      AND cardinality(vs.words) > 0
      ${feed_min_duration_clause}
      ${excludeClause}
    LIMIT ${input.limit}
  `);
}

export async function fetch_new_candidates(
  prisma: PrismaService,
  input: {
    knownUnion: string[];
    knownWords: string[];
    excludeIds: number[];
    limit: number;
  },
): Promise<SegmentCandidateRow[]> {
  const excludeClause =
    input.excludeIds.length > 0
      ? Prisma.sql`AND vs.id NOT IN (${Prisma.join(input.excludeIds)})`
      : Prisma.empty;
  return prisma.$queryRaw<SegmentCandidateRow[]>(Prisma.sql`
    SELECT
      vs.id,
      vs.content_video_id,
      vs.start_time_sec,
      vs.end_time_sec,
      vs.full_phrase,
      vs.proficiency_level,
      vs.accent,
      vs.words,
      0::float AS cos_sim
    FROM video_segments vs
    WHERE cardinality(
      ARRAY(
        SELECT unnest(vs.words)
        EXCEPT
        SELECT unnest(${input.knownUnion}::text[])
      )
    ) >= 1
    AND cardinality(vs.words) > 0
    ${feed_min_duration_clause}
    ${excludeClause}
    LIMIT ${input.limit}
  `);
}

export async function fetch_exploration_fallback(
  prisma: PrismaService,
  input: {
    proficiencyLevel: number;
    excludeIds: number[];
    limit: number;
  },
): Promise<SegmentCandidateRow[]> {
  const excludeClause =
    input.excludeIds.length > 0
      ? Prisma.sql`AND vs.id NOT IN (${Prisma.join(input.excludeIds)})`
      : Prisma.empty;
  return prisma.$queryRaw<SegmentCandidateRow[]>(Prisma.sql`
    SELECT
      vs.id,
      vs.content_video_id,
      vs.start_time_sec,
      vs.end_time_sec,
      vs.full_phrase,
      vs.proficiency_level,
      vs.accent,
      vs.words,
      0::float AS cos_sim
    FROM video_segments vs
    WHERE cardinality(vs.words) > 0
      ${feed_min_duration_clause}
      AND (vs.proficiency_level IS NULL OR vs.proficiency_level BETWEEN ${Math.max(1, input.proficiencyLevel - 1)} AND ${Math.min(6, input.proficiencyLevel + 1)})
      ${excludeClause}
    ORDER BY vs.id DESC
    LIMIT ${input.limit}
  `);
}

export async function fetch_feed_candidates(
  prisma: PrismaService,
  mode: FeedMode,
  input: {
    knownWords: string[];
    learningWords: string[];
    excludeIds: number[];
    proficiencyLevel: number;
    limit: number;
  },
): Promise<SegmentCandidateRow[]> {
  const knownUnion = [...new Set([...input.knownWords, ...input.learningWords])];
  if (mode === "review") {
    if (input.learningWords.length === 0) {
      return fetch_exploration_fallback(prisma, {
        proficiencyLevel: input.proficiencyLevel,
        excludeIds: input.excludeIds,
        limit: input.limit,
      });
    }
    return fetch_review_candidates(prisma, {
      knownUnion,
      learningWords: input.learningWords,
      excludeIds: input.excludeIds,
      limit: input.limit,
    });
  }
  if (knownUnion.length === 0) {
    return fetch_exploration_fallback(prisma, {
      proficiencyLevel: input.proficiencyLevel,
      excludeIds: input.excludeIds,
      limit: input.limit,
    });
  }
  return fetch_new_candidates(prisma, {
    knownUnion,
    knownWords: input.knownWords,
    excludeIds: input.excludeIds,
    limit: input.limit,
  });
}
