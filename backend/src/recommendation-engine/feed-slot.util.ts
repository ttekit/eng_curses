import type { PrismaService } from "src/prisma.service";
import { fetch_feed_candidates } from "./feed-candidate.queries";
import type { FeedFreshnessContext } from "./feed-freshness.util";
import { resolve_feed_target_word } from "./feed-target-word.util";
import type {
  FeedMode,
  LearnerLexicon,
  LearnerProfileState,
  ScoredSegmentCandidate,
  Vector384,
} from "./recommendation.types";
import { filter_learnable_words } from "src/srs/proper-noun.util";
import { rank_feed_candidates } from "./segment-enrichment.util";

const REVIEW_SLOT_PROBABILITY = 0.7;

function has_learnable_target(
  words: string[],
  fullPhrase: string,
  mode: FeedMode,
  lexicon: LearnerLexicon,
): boolean {
  const learnableWords = filter_learnable_words(words, fullPhrase);
  return (
    resolve_feed_target_word(learnableWords, mode, {
      knownWords: lexicon.knownWords,
      learningWords: lexicon.learningWords,
    }) !== null
  );
}

export async function fill_feed_slots(input: {
  prisma: PrismaService;
  profile: LearnerProfileState;
  lexicon: LearnerLexicon;
  interestsVector: Vector384 | null;
  freshness: FeedFreshnessContext;
  excludeIds: number[];
  limit: number;
}): Promise<ScoredSegmentCandidate[]> {
  const selected: ScoredSegmentCandidate[] = [];
  const usedIds = [...input.excludeIds];
  for (let slot = 0; slot < input.limit; slot += 1) {
    const mode: FeedMode =
      Math.random() < REVIEW_SLOT_PROBABILITY ? "review" : "new";
    let rows = await fetch_feed_candidates(input.prisma, mode, {
      knownWords: [...input.lexicon.knownWords],
      learningWords: [...input.lexicon.learningWords.keys()],
      excludeIds: usedIds,
      proficiencyLevel: input.profile.proficiencyLevel,
      limit: 200,
    });
    if (rows.length === 0) {
      const fallbackMode: FeedMode = mode === "review" ? "new" : "review";
      rows = await fetch_feed_candidates(input.prisma, fallbackMode, {
        knownWords: [...input.lexicon.knownWords],
        learningWords: [...input.lexicon.learningWords.keys()],
        excludeIds: usedIds,
        proficiencyLevel: input.profile.proficiencyLevel,
        limit: 200,
      });
    }
    const ranked = rank_feed_candidates(
      rows,
      input.profile,
      input.lexicon,
      mode,
      input.interestsVector,
      input.freshness,
    );
    const pick = ranked.find(
      (item) =>
        !usedIds.includes(item.segmentId) &&
        has_learnable_target(
          item.words,
          item.fullPhrase,
          mode,
          input.lexicon,
        ),
    );
    if (!pick) {
      continue;
    }
    usedIds.push(pick.segmentId);
    selected.push(pick);
  }
  return selected;
}
