import { clamp, getBaseLevel } from 'src/alcorythm/alcorythm-scoring.util';
import { VIDEO_SYSTEM_TAG_LEVELS } from 'src/contents/video-content-metadata.constants';

/** Maps CEFR labels to [0,1] difficulty units (aligned with getBaseLevel). */
const CEFR_UNIT: Record<string, number> = {
  'Pre-A1': 0.05,
  A1: 0.1,
  A2: 0.2,
  B1: 0.4,
  B2: 0.6,
  C1: 0.8,
  C2: 1.0,
};

const CEFR_ALLOWED = new Set<string>(VIDEO_SYSTEM_TAG_LEVELS as unknown as string[]);

const USER_CEFR_BLEND = 0.4;
const PHASE_CEFR_BLEND = 0.6;

/**
 * User-reported or profile CEFR / English level string → unit on [0,1].
 */
export function userEnglishLevelToCefrUnit(level: string | null | undefined): number {
  if (!level?.trim()) {
    return 0.2;
  }
  const t = level.trim();
  if (CEFR_UNIT[t] !== undefined) {
    return CEFR_UNIT[t];
  }
  return getBaseLevel(t.toUpperCase());
}

/**
 * Blends profile and active-phase target CEFR for recommendation difficulty.
 */
export function blendCefrUnits(userUnit: number, phaseUnit: number): number {
  return clamp(
    USER_CEFR_BLEND * userUnit + PHASE_CEFR_BLEND * phaseUnit,
    0,
    1,
  );
}

/**
 * Video `ContentStats.systemTags` (CEFR list) → average difficulty in [0,1].
 */
export function videoSystemTagsToCefrUnit(systemTags: string[]): number {
  const vals = systemTags
    .filter((s) => CEFR_ALLOWED.has(s))
    .map((s) => CEFR_UNIT[s] ?? 0.4);
  if (vals.length === 0) {
    return 0.4;
  }
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/**
 * Vocabulary / knowledge strength from per-topic scores [0,1] (user_language_data).
 */
export function vocabularyStrengthFromTopicScores(
  scores: number[],
  fallback: number,
): number {
  if (scores.length === 0) {
    return clamp(fallback, 0, 1);
  }
  return clamp(
    scores.reduce((a, b) => a + b, 0) / scores.length,
    0,
    1,
  );
}

/**
 * Listening-heavy blend per topic when ranking video content.
 */
export function blendedVideoTopicKnowledge(
  listening: number,
  vocabulary: number,
  grammar: number,
): number {
  return clamp(
    0.52 * listening + 0.28 * vocabulary + 0.2 * grammar,
    0,
    1,
  );
}

function tokenSet(tokens: string[]): Set<string> {
  const s = new Set<string>();
  for (const t of tokens) {
    const x = t.trim().toLowerCase();
    if (x.length > 0) {
      s.add(x);
    }
  }
  return s;
}

/**
 * Hobbies, interests, job, genres, topic names, and work/education for theme matching to video `userTags`.
 */
export function buildUserThemeTokens(input: {
  hobbies: string[];
  interests: string[];
  workField: string | null;
  education: string | null;
  job: string | null;
  selectedTopicNames: string[];
  strongTopicTagNames: string[];
  favoriteGenreNames: string[];
}): Set<string> {
  const parts: string[] = [
    ...input.hobbies,
    ...input.interests,
    ...input.selectedTopicNames,
    ...input.strongTopicTagNames,
    ...input.favoriteGenreNames,
  ];
  if (input.workField?.trim()) {
    parts.push(input.workField);
  }
  if (input.education?.trim()) {
    parts.push(input.education);
  }
  if (input.job?.trim()) {
    parts.push(input.job);
  }
  return tokenSet(parts);
}

/**
 * 0 = no match, 1 = strong overlap with video userTags.
 */
export function userThemeMatchScore(
  videoUserTags: string[],
  userTokens: Set<string>,
): number {
  if (videoUserTags.length === 0) {
    return 0.55;
  }
  if (userTokens.size === 0) {
    return 0.4;
  }
  let weight = 0;
  for (const raw of videoUserTags) {
    const v = raw.trim().toLowerCase();
    if (userTokens.has(v)) {
      weight += 1;
      continue;
    }
    for (const u of userTokens) {
      if (v.length > 2 && (v.includes(u) || u.includes(v))) {
        weight += 0.65;
        break;
      }
    }
  }
  return clamp(weight / videoUserTags.length, 0, 1);
}

/**
 * Prefer videos near “ideal” load: user base + small stretch from vocabulary.
 */
export function targetProcessingComplexity(
  userCefrUnit: number,
  vocabularyStrength: number,
): number {
  const v = clamp(vocabularyStrength, 0, 1);
  const base = 2.5 + userCefrUnit * 4.5;
  const boost = (v - 0.3) * 2;
  return clamp(base + boost, 1, 10);
}

export function processingComplexityFit(
  videoComplexity: number | null,
  target: number,
): number {
  const c = videoComplexity != null ? videoComplexity : 5;
  return clamp(1 - Math.abs(c - target) / 5, 0, 1);
}

/**
 * Slight “i+1” band: a bit above user is OK; far below/above is worse.
 */
export function cefrBandFit(userUnit: number, videoUnit: number): number {
  const delta = videoUnit - userUnit;
  if (delta >= -0.12 && delta <= 0.22) {
    return 1;
  }
  if (delta < -0.12) {
    return clamp(1 + delta * 4, 0, 1);
  }
  return clamp(1 - (delta - 0.22) * 2.2, 0, 1);
}

/**
 * If the video is linked to topics, higher user scores on those topics → better fit.
 */
export function topicKnowledgeFit(
  videoTopicIds: number[],
  topicIdToUserScore: Map<number, number>,
): number {
  if (videoTopicIds.length === 0) {
    return 0.55;
  }
  let s = 0;
  for (const id of videoTopicIds) {
    s += topicIdToUserScore.get(id) ?? 0.38;
  }
  return clamp(s / videoTopicIds.length, 0, 1);
}

/**
 * Alignment with topics assigned to the learner's active studying-plan phase.
 */
export function phaseTopicsFit(
  videoTopicIds: number[],
  phaseTopicIds: number[],
  phaseTopicNames: string[],
  phaseTopicTagNames: string[],
  videoUserTags: string[],
): number {
  if (phaseTopicIds.length === 0) {
    return 0.55;
  }
  const phaseIdSet = new Set(phaseTopicIds);
  for (const id of videoTopicIds) {
    if (phaseIdSet.has(id)) {
      return 1;
    }
  }
  const nameTokens = tokenSet([
    ...phaseTopicNames,
    ...phaseTopicTagNames,
  ]);
  if (nameTokens.size > 0) {
    for (const rawName of phaseTopicNames) {
      const name = rawName.trim().toLowerCase();
      if (name.length < 2) {
        continue;
      }
      for (const rawTag of videoUserTags) {
        const tag = rawTag.trim().toLowerCase();
        if (
          tag.length > 1 &&
          (name.includes(tag) || tag.includes(name))
        ) {
          return 0.85;
        }
      }
    }
    const soft = userThemeMatchScore(videoUserTags, nameTokens);
    if (soft >= 0.4) {
      return clamp(0.65 + soft * 0.35, 0, 1);
    }
  }
  return 0.35;
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

/**
 * Favorite / hated genre names vs video `userTags` (case-insensitive).
 */
export function genrePreferenceFit(
  videoUserTags: string[],
  favoriteGenreNames: string[],
  hatedGenreNames: string[],
): number {
  if (videoUserTags.length === 0) {
    return favoriteGenreNames.length === 0 && hatedGenreNames.length === 0 ?
        0.55
      : 0.45;
  }
  const favorites = new Set(
    favoriteGenreNames.map((g) => normalizeTag(g)).filter((g) => g.length > 0),
  );
  const hated = new Set(
    hatedGenreNames.map((g) => normalizeTag(g)).filter((g) => g.length > 0),
  );
  if (favorites.size === 0 && hated.size === 0) {
    return 0.55;
  }
  let favoriteHits = 0;
  let hatedHits = 0;
  for (const raw of videoUserTags) {
    const v = normalizeTag(raw);
    if (!v) {
      continue;
    }
    for (const fav of favorites) {
      if (v === fav || (v.length > 2 && (v.includes(fav) || fav.includes(v)))) {
        favoriteHits += 1;
        break;
      }
    }
    for (const hate of hated) {
      if (v === hate || (v.length > 2 && (v.includes(hate) || hate.includes(v)))) {
        hatedHits += 1;
        break;
      }
    }
  }
  const favoriteFit =
    favorites.size === 0 ? 0.5 : clamp(favoriteHits / videoUserTags.length, 0, 1);
  const penalty = hatedHits * 0.7;
  return clamp(favoriteFit - penalty, 0, 1);
}

export type ScoreWeights = {
  cefr: number;
  complexity: number;
  themes: number;
  topicKnowledge: number;
  phaseTopics: number;
  genres: number;
};

export type RecommendationScoreParts = {
  cefr: number;
  complexity: number;
  themes: number;
  topicKnowledge: number;
  phaseTopics: number;
  genres: number;
};

const DEFAULT_WEIGHTS: ScoreWeights = {
  cefr: 0.22,
  complexity: 0.15,
  themes: 0.18,
  topicKnowledge: 0.13,
  phaseTopics: 0.22,
  genres: 0.1,
};

export function totalWeightedScore(
  parts: RecommendationScoreParts,
  weights: ScoreWeights = DEFAULT_WEIGHTS,
): number {
  return clamp(
    parts.cefr * weights.cefr +
      parts.complexity * weights.complexity +
      parts.themes * weights.themes +
      parts.topicKnowledge * weights.topicKnowledge +
      parts.phaseTopics * weights.phaseTopics +
      parts.genres * weights.genres,
    0,
    1,
  );
}
