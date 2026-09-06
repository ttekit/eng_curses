import { Prisma } from "@generated/prisma/client";
import type { PrismaService } from "src/prisma.service";
import type { SegmentCandidateRow } from "./recommendation.types";
import { feed_min_duration_clause } from "./segment-duration.util";

export async function fetch_context_shift_candidates(
  prisma: PrismaService,
  input: {
    currentSegmentId: number;
    clickedWord: string;
    knownWords: string[];
    limit: number;
  },
): Promise<SegmentCandidateRow[]> {
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
    WHERE vs.id != ${input.currentSegmentId}
      AND ${input.clickedWord} = ANY(vs.words)
      AND (
        SELECT COALESCE(
          bool_and(w = ANY(${input.knownWords}::text[]) OR w = ${input.clickedWord}),
          TRUE
        )
        FROM unnest(vs.words) AS w
      )
      ${feed_min_duration_clause}
    LIMIT ${input.limit}
  `);
}
