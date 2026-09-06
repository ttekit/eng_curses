import type { PrismaService } from "src/prisma.service";
import type { FeedSegmentDto } from "src/srs/feed.types";
import { filter_learnable_words } from "src/srs/proper-noun.util";
import type {
  FeedMode,
  LearnerLexicon,
  LearnerProfileState,
  ScoredSegmentCandidate,
  SegmentCandidateRow,
  Vector384,
} from "./recommendation.types";
import {
  build_score_breakdown,
  compute_context_distance,
  compute_shift_score,
} from "./recommendation-scoring.util";
import { hash_embed } from "./hash-embedding.util";
import { is_feed_eligible_duration } from "./segment-duration.util";
import {
  apply_feed_freshness_penalty,
  type FeedFreshnessContext,
} from "./feed-freshness.util";
import { resolve_feed_target_word } from "./feed-target-word.util";

export function rank_feed_candidates(
  rows: SegmentCandidateRow[],
  profile: LearnerProfileState,
  lexicon: LearnerLexicon,
  mode: FeedMode,
  interestsVector: Vector384 | null,
  freshness?: FeedFreshnessContext,
): ScoredSegmentCandidate[] {
  return rows
    .map((row) => {
      const contextVector = row.full_phrase
        ? hash_embed(row.full_phrase)
        : null;
      const breakdown = build_score_breakdown({
        interestsVector,
        contextVector,
        cosSimFallback: row.cos_sim ?? 0,
        userLevel: profile.proficiencyLevel,
        segmentLevel: row.proficiency_level,
        userAccent: profile.targetAccent,
        segmentAccent: row.accent,
        segmentWords: row.words,
        lexicon,
      });
      const total = freshness
        ? apply_feed_freshness_penalty(breakdown.total, {
            segmentId: row.id,
            contentVideoId: row.content_video_id,
            seenSegmentIds: freshness.seenSegmentIds,
            watchedVideoIds: freshness.watchedVideoIds,
          })
        : breakdown.total;
      return {
        segmentId: row.id,
        contentVideoId: row.content_video_id,
        startTimeSec: row.start_time_sec,
        endTimeSec: row.end_time_sec,
        fullPhrase: row.full_phrase,
        proficiencyLevel: row.proficiency_level,
        accent: row.accent,
        words: row.words,
        breakdown: { ...breakdown, total },
        feedKind: mode,
      };
    })
    .sort((left, right) => right.breakdown.total - left.breakdown.total);
}

export function rank_context_shift_candidates(
  rows: SegmentCandidateRow[],
  input: {
    profile: LearnerProfileState;
    currentVector: Vector384 | null;
    interestsVector: Vector384 | null;
  },
): ScoredSegmentCandidate[] {
  return rows
    .map((row) => {
      const candidateVector = row.full_phrase ? hash_embed(row.full_phrase) : null;
      const dCos = compute_context_distance(
        input.currentVector,
        candidateVector,
        row.cos_sim ?? 0,
      );
      const sContext = row.cos_sim ?? 0;
      const sAccent =
        input.profile.targetAccent === row.accent ? 1 : 0;
      const total = compute_shift_score({ dCos, sContext, sAccent });
      return {
        segmentId: row.id,
        contentVideoId: row.content_video_id,
        startTimeSec: row.start_time_sec,
        endTimeSec: row.end_time_sec,
        fullPhrase: row.full_phrase,
        proficiencyLevel: row.proficiency_level,
        accent: row.accent,
        words: row.words,
        breakdown: {
          sContext,
          sLevel: 0,
          sAccent,
          sSrs: dCos,
          total,
        },
        feedKind: "review" as FeedMode,
      };
    })
    .sort((left, right) => right.breakdown.total - left.breakdown.total);
}

export async function enrich_to_feed_dtos(
  prisma: PrismaService,
  userId: number,
  candidates: ScoredSegmentCandidate[],
  options?: { targetWordBySegmentId?: ReadonlyMap<number, string> },
): Promise<FeedSegmentDto[]> {
  if (candidates.length === 0) {
    return [];
  }
  const segmentIds = candidates.map((item) => item.segmentId);
  const segments = await prisma.videoSegment.findMany({
    where: { id: { in: segmentIds } },
    include: {
      contentVideo: { select: { videoLink: true } },
      lemmas: { include: { lemma: { select: { id: true, word: true } } } },
    },
  });
  const memories = await prisma.userWordMemory.findMany({ where: { userId } });
  const memoryByWord = new Map(memories.map((row) => [row.word, row]));
  const profile = await prisma.learnerEngineProfile.findUnique({
    where: { userId },
    select: { knownWords: true },
  });
  const knownWords = new Set(profile?.knownWords ?? []);
  const learningWords = new Map(
    memories.map((row) => [
      row.word,
      {
        memoryStrength: row.memoryStrength,
        lastSeenAt: row.lastSeenAt,
      },
    ]),
  );
  const byId = new Map(segments.map((segment) => [segment.id, segment]));
  const nowMs = Date.now();
  return candidates.flatMap((candidate) => {
    const segment = byId.get(candidate.segmentId);
    if (!segment) {
      return [];
    }
    if (!is_feed_eligible_duration(segment.startTimeSec, segment.endTimeSec)) {
      return [];
    }
    const learnableWords = filter_learnable_words(
      candidate.words,
      candidate.fullPhrase,
    );
    const targetWord =
      options?.targetWordBySegmentId?.get(candidate.segmentId) ??
      resolve_feed_target_word(learnableWords, candidate.feedKind, {
        knownWords,
        learningWords,
      });
    const targetLemma = segment.lemmas
      .filter((link) => link.lemma.word === targetWord)
      .sort((left, right) => left.position - right.position)[0];
    if (!targetWord || !targetLemma) {
      return [];
    }
    const memory = memoryByWord.get(targetLemma.lemma.word);
    const feedTokens = [{
      word: targetLemma.lemma.word,
      lemmaId: targetLemma.lemmaId,
      position: targetLemma.position,
      timeSinceLastReviewSec: memory
        ? (nowMs - memory.lastSeenAt.getTime()) / 1000
        : null,
    }];
    return [{
      segmentId: candidate.segmentId,
      contentVideoId: candidate.contentVideoId,
      fileUrl: segment.contentVideo.videoLink,
      startTimeSec: candidate.startTimeSec,
      endTimeSec: candidate.endTimeSec,
      fullPhrase: candidate.fullPhrase,
      difficultyLevel: segment.difficultyLevel,
      feedKind: candidate.feedKind,
      tokens: feedTokens,
    }];
  });
}
