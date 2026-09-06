import type { PrismaService } from "src/prisma.service";
import type { FeedSegmentDto } from "src/srs/feed.types";
import { fetch_exploration_fallback } from "./feed-candidate.queries";
import type { FeedFreshnessContext } from "./feed-freshness.util";
import type {
  LearnerLexicon,
  LearnerProfileState,
} from "./recommendation.types";
import { rank_feed_candidates } from "./segment-enrichment.util";
import { enrich_to_feed_dtos } from "./segment-enrichment.util";

export async function build_exploration_feed_dtos(
  prisma: PrismaService,
  userId: number,
  input: {
    profile: LearnerProfileState;
    lexicon: LearnerLexicon;
    freshness: FeedFreshnessContext;
    excludeIds: number[];
    limit: number;
  },
): Promise<FeedSegmentDto[]> {
  const poolSize = Math.max(input.limit * 4, 24);
  const rows = await fetch_exploration_fallback(prisma, {
    proficiencyLevel: input.profile.proficiencyLevel,
    excludeIds: input.excludeIds,
    limit: poolSize,
  });
  const ranked = rank_feed_candidates(
    rows,
    input.profile,
    input.lexicon,
    "new",
    input.profile.interestsVector,
    input.freshness,
  );
  return enrich_to_feed_dtos(prisma, userId, ranked.slice(0, input.limit));
}
