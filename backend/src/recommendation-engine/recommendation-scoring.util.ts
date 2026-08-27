import type { LearnerLexicon, ScoreBreakdown, Vector384, WordMemoryRow } from "./recommendation.types";
import { cosine_similarity } from "./hash-embedding.util";

export function compute_s_context(
  interestsVector: Vector384 | null,
  contextVector: Vector384 | null,
  cosSimFallback = 0,
): number {
  if (interestsVector && contextVector) {
    return cosine_similarity(interestsVector, contextVector);
  }
  return cosSimFallback;
}

export function compute_s_level(
  userLevel: number,
  segmentLevel: number | null,
): number {
  const segment = segmentLevel ?? userLevel;
  return 1 - Math.abs(userLevel - segment) / 5;
}

export function compute_s_accent(
  userAccent: string,
  segmentAccent: string,
): number {
  return userAccent === segmentAccent ? 1 : 0;
}

export function compute_s_srs(
  segmentWords: string[],
  lexicon: LearnerLexicon,
  nowMs = Date.now(),
): number {
  let maxScore = 0;
  for (const word of segmentWords) {
    const memory = lexicon.learningWords.get(word);
    if (!memory) {
      continue;
    }
    const deltaT_days =
      (nowMs - memory.lastSeenAt.getTime()) / 86_400_000;
    const score = 1 - Math.exp(-deltaT_days / memory.memoryStrength);
    maxScore = Math.max(maxScore, score);
  }
  return maxScore;
}

export function compute_feed_score(input: {
  sContext: number;
  sSrs: number;
  sLevel: number;
  sAccent: number;
}): number {
  return (
    0.35 * input.sContext +
    0.35 * input.sSrs +
    0.15 * input.sLevel +
    0.15 * input.sAccent
  );
}

export function build_score_breakdown(input: {
  interestsVector: Vector384 | null;
  contextVector: Vector384 | null;
  cosSimFallback?: number;
  userLevel: number;
  segmentLevel: number | null;
  userAccent: string;
  segmentAccent: string;
  segmentWords: string[];
  lexicon: LearnerLexicon;
}): ScoreBreakdown {
  const sContext = compute_s_context(
    input.interestsVector,
    input.contextVector,
    input.cosSimFallback ?? 0,
  );
  const sLevel = compute_s_level(input.userLevel, input.segmentLevel);
  const sAccent = compute_s_accent(input.userAccent, input.segmentAccent);
  const sSrs = compute_s_srs(input.segmentWords, input.lexicon);
  const total = compute_feed_score({ sContext, sSrs, sLevel, sAccent });
  return { sContext, sLevel, sAccent, sSrs, total };
}

export function compute_context_distance(
  currentVector: Vector384 | null,
  candidateVector: Vector384 | null,
  cosSimFallback = 0,
): number {
  const similarity = compute_s_context(
    currentVector,
    candidateVector,
    cosSimFallback,
  );
  return 1 - similarity;
}

export function compute_shift_score(input: {
  dCos: number;
  sContext: number;
  sAccent: number;
}): number {
  return 0.6 * input.dCos + 0.2 * input.sContext + 0.2 * input.sAccent;
}

export function days_since(date: Date, nowMs = Date.now()): number {
  return Math.max((nowMs - date.getTime()) / 86_400_000, 0.01);
}

export function memory_row_from_segment_word(
  word: string,
  lexicon: LearnerLexicon,
): WordMemoryRow | null {
  return lexicon.learningWords.get(word) ?? null;
}
