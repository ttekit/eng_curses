import { UserProfileContext } from './alcorythm.types';

export const AI_ALGORITHM_VERSION = 'v5';

/** Upper bound of topic.complexity in seed/catalog (≈1 … 3.5). */
export const TOPIC_COMPLEXITY_SCALE_MAX = 3.5;

const CEFR_UNIT: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
};

/** Numeric CEFR band (A1=1 … C2=6). */
export function cefrUnit(englishLevel?: string | null): number {
  if (!englishLevel?.trim()) {
    return 2;
  }
  return CEFR_UNIT[englishLevel.trim().toUpperCase()] ?? 2;
}

/** True for B2, C1, C2 — profile work/hobby lifts apply only above B1. */
export function isEnglishLevelAboveB1(englishLevel?: string | null): boolean {
  return cefrUnit(englishLevel) >= 4;
}

/** Maps catalog topic complexity (1–3.5) to a CEFR-like unit (A1=1 … C2=6). */
export function topicComplexityToCefrUnit(topicComplexity: number): number {
  const normalized = clamp(
    topicComplexity ?? 2,
    1,
    TOPIC_COMPLEXITY_SCALE_MAX,
  );
  const span = TOPIC_COMPLEXITY_SCALE_MAX - 1;
  return 1 + ((normalized - 1) / span) * 5;
}

/** Topic difficulty vs learner (positive = topic is harder). */
export function topicComplexityGap(
  englishLevel: string | null | undefined,
  topicComplexity: number,
): number {
  const learnerUnit = cefrUnit(englishLevel);
  const topicUnit = topicComplexityToCefrUnit(topicComplexity);
  return topicUnit - learnerUnit;
}

/**
 * Maximum uninferred prior when profile strongly matches a topic at the learner band.
 */
export function realisticPriorCeiling(
  englishLevel: string | null | undefined,
  profileMatchStrength: number,
): number {
  const learnerCapacity = getBaseLevel(englishLevel);
  const aboveB1 = isEnglishLevelAboveB1(englishLevel);
  const matchHeadroom = aboveB1 ? 0.12 + 0.18 * profileMatchStrength : 0.06 * profileMatchStrength;
  return clamp(learnerCapacity + matchHeadroom);
}

export type TopicKnowledgePrior = {
  score: number;
  listeningScore: number;
  vocabularyScore: number;
  grammarScore: number;
  confidence: number;
  coverage: number;
};

/**
 * Profile-only estimate before any quiz evidence on a topic.
 * Each domain starts at 0% unless the topic matches the profile or is foundational at/below band.
 * Work/hobby alignment boosts apply only when declared level is above B1.
 */
export function computeTopicKnowledgePrior(params: {
  profile: UserProfileContext;
  topicName: string;
  tagNames: string[];
  topicComplexity: number;
  primaryStrength: number;
  secondaryStrength: number;
  isSelectedTopic: boolean;
  confidence: number;
}): TopicKnowledgePrior {
  const { profile, topicName, tagNames, topicComplexity } = params;
  const profileMatch = clamp(
    params.primaryStrength * 0.55 +
      params.secondaryStrength * 0.35 +
      (params.isSelectedTopic ? 0.25 : 0),
  );
  const learnerCapacity = getBaseLevel(profile.englishLevel);
  const gap = topicComplexityGap(profile.englishLevel, topicComplexity);
  const aboveB1 = isEnglishLevelAboveB1(profile.englishLevel);

  let blended = 0;
  if (profileMatch >= 0.12) {
    const hardnessPenalty = gap > 0 ? clamp(gap * 0.2, 0, 0.9) : 0;
    blended = learnerCapacity * profileMatch * (1 - hardnessPenalty);
    if (aboveB1) {
      blended +=
        0.1 * params.primaryStrength + 0.06 * params.secondaryStrength;
    }
    blended = clamp(Math.min(realisticPriorCeiling(profile.englishLevel, profileMatch), blended));
  } else if (gap <= 0.2 && topicComplexity <= 1.35) {
    blended = clamp(Math.min(0.09, learnerCapacity * 0.4));
  }

  const normalizedComplexity = clamp((topicComplexity ?? 1) / TOPIC_COMPLEXITY_SCALE_MAX);
  const skills = splitTopicSkillScores({
    blended,
    topicName,
    tagNames,
    primaryStrength: params.primaryStrength,
    secondaryStrength: params.secondaryStrength,
    normalizedComplexity,
    profile,
  });
  const score = aggregateSkillScore(
    skills.listening,
    skills.vocabulary,
    skills.grammar,
  );
  const matchedSignals =
    params.primaryStrength +
    params.secondaryStrength +
    (params.isSelectedTopic ? 1 : 0);
  return {
    score,
    listeningScore: skills.listening,
    vocabularyScore: skills.vocabulary,
    grammarScore: skills.grammar,
    confidence: params.confidence,
    coverage: clamp(matchedSignals / 3),
  };
}

export function aggregateSkillScore(
  listening: number,
  vocabulary: number,
  grammar: number,
): number {
  return clamp((listening + vocabulary + grammar) / 3);
}

/**
 * Split a blended per-topic strength [0,1] into listening / vocabulary / grammar using
 * topic tags, name, profile match strengths, and light profile signals.
 */
export function splitTopicSkillScores(params: {
  blended: number;
  topicName: string;
  tagNames: string[];
  primaryStrength: number;
  secondaryStrength: number;
  normalizedComplexity: number;
  profile: UserProfileContext;
}): { listening: number; vocabulary: number; grammar: number } {
  if (params.blended <= 0) {
    return { listening: 0, vocabulary: 0, grammar: 0 };
  }
  const hay = `${params.topicName} ${params.tagNames.join(' ')}`.toLowerCase();

  let listeningAdj = 0;
  if (
    /\b(listen|listening|podcast|audio|pronunciation|accent|conversation|dialogue|dialog)\b/.test(
      hay,
    )
  ) {
    listeningAdj += 0.07;
  }
  if (params.normalizedComplexity >= 0.55) {
    listeningAdj += 0.03;
  }
  const listenHobby = params.profile.hobbies.some((h) =>
    /\b(podcast|film|movie|series|youtube|music|radio|audiobook|streaming|concert|gig)\b/i.test(
      h,
    ),
  );
  if (listenHobby && isEnglishLevelAboveB1(params.profile.englishLevel)) {
    listeningAdj += 0.065;
  }

  let vocabularyAdj = 0;
  if (
    /\b(vocab|vocabulary|word|idiom|phrase|lexis|collocation|expression|phrasal)\b/.test(
      hay,
    )
  ) {
    vocabularyAdj += 0.07;
  }

  const readHobby = params.profile.hobbies.some((h) =>
    /\b(read|reading|books|novel|literature|manga|comics|blogs?|writing|journal)\b/i.test(
      h,
    ),
  );
  if (readHobby && isEnglishLevelAboveB1(params.profile.englishLevel)) {
    vocabularyAdj += 0.055;
  }

  if (isEnglishLevelAboveB1(params.profile.englishLevel)) {
    vocabularyAdj +=
      0.1 * params.primaryStrength + 0.075 * params.secondaryStrength;
  }

  let grammarAdj = 0;
  if (
    /\b(grammar|tense|clause|syntax|structure|article|preposition|modal)\b/.test(hay)
  ) {
    grammarAdj += 0.07;
  }
  const formal =
    Boolean(params.profile.education?.trim()) ||
    Boolean(params.profile.workField?.trim()) ||
    Boolean(params.profile.job?.trim());
  if (formal) {
    grammarAdj += 0.055;
  }

  const meanAdj = (listeningAdj + vocabularyAdj + grammarAdj) / 3;
  listeningAdj -= meanAdj;
  vocabularyAdj -= meanAdj;
  grammarAdj -= meanAdj;

  return {
    listening: clamp(params.blended + listeningAdj),
    vocabulary: clamp(params.blended + vocabularyAdj),
    grammar: clamp(params.blended + grammarAdj),
  };
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function getBaseLevel(englishLevel?: string | null): number {
  const map: Record<string, number> = {
    A1: 0.1,
    A2: 0.2,
    B1: 0.4,
    B2: 0.6,
    C1: 0.8,
    C2: 1,
  };

  if (!englishLevel) {
    return 0.2;
  }

  return map[englishLevel.toUpperCase()] ?? 0.2;
}

export function normalizeKeywords(values: Array<string | null | undefined>): string[] {
  return values
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim().toLowerCase());
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1);
}

export function keywordMatchStrength(
  topicName: string,
  tagNames: string[],
  keywords: string[],
): number {
  if (!keywords.length) {
    return 0;
  }

  const haystack = `${topicName} ${tagNames.join(' ')}`.toLowerCase();
  const hayTokens = new Set(tokenize(haystack));
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (!normalizedKeyword) {
      continue;
    }

    if (haystack.includes(normalizedKeyword) || normalizedKeyword.includes(haystack)) {
      score += 1;
      continue;
    }

    const keywordTokens = tokenize(normalizedKeyword);
    if (!keywordTokens.length) {
      continue;
    }

    const matched = keywordTokens.filter((token) => hayTokens.has(token)).length;
    if (matched > 0) {
      score += matched / keywordTokens.length;
    }
  }

  return clamp(score / keywords.length);
}

export function calculateConfidence(params: {
  hasEnglishLevel: boolean;
  hasLanguageBackground: boolean;
  hasPrimarySignals: boolean;
  hasSecondarySignals: boolean;
  hasSelectedTopics: boolean;
}): number {
  let confidence = 0.25;

  if (params.hasEnglishLevel) {
    confidence += 0.25;
  }
  if (params.hasLanguageBackground) {
    confidence += 0.1;
  }
  if (params.hasPrimarySignals) {
    confidence += 0.24;
  }
  if (params.hasSecondarySignals) {
    confidence += 0.2;
  }
  if (params.hasSelectedTopics) {
    confidence += 0.15;
  }

  return clamp(confidence);
}

export function getDeterministicTagScore(params: {
  profile: UserProfileContext;
  tagName: string;
  topics: Array<{ id: number; name: string; complexity: number }>;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  confidence: number;
}): number {
  const topics = params.topics ?? [];
  if (!topics.length) {
    return 0;
  }

  const scores = topics.map((topic) => {
    const tagNames = [params.tagName];
    const primaryStrength = keywordMatchStrength(
      topic.name,
      tagNames,
      params.primaryKeywords,
    );
    const secondaryStrength = keywordMatchStrength(
      topic.name,
      tagNames,
      params.secondaryKeywords,
    );
    const prior = computeTopicKnowledgePrior({
      profile: params.profile,
      topicName: topic.name,
      tagNames,
      topicComplexity: topic.complexity,
      primaryStrength,
      secondaryStrength,
      isSelectedTopic: params.profile.selectedTopicIds.has(topic.id),
      confidence: params.confidence,
    });
    return prior.score;
  });

  const total = scores.reduce((sum, value) => sum + value, 0);
  return clamp(total / scores.length);
}

export function buildProfileContext(profile: any): UserProfileContext {
  const knownLanguageLevels = Array.isArray(profile.knownLanguageLevels)
    ? profile.knownLanguageLevels
        .filter((item: any) => item && typeof item.language === 'string' && typeof item.level === 'string')
        .map((item: any) => ({ language: item.language, level: item.level }))
    : [];

  return {
    englishLevel: profile.englishLevel,
    nativeLanguage: profile.nativeLanguage,
    knownLanguages: profile.knownLanguages ?? [],
    knownLanguageLevels,
    education: profile.education,
    workField: profile.workField,
    job: profile.job,
    hobbies: profile.hobbies ?? [],
    selectedTopicIds: new Set<number>((profile.selectedTopics ?? []).map((topic: any) => topic.id)),
    selectedTopicNames: (profile.selectedTopics ?? []).map((topic: any) => topic.name),
  };
}

export function getLanguageBackgroundBoost(params: {
  nativeLanguage?: string | null;
  knownLanguages: string[];
  knownLanguageLevels: Array<{ language: string; level: string }>;
  englishLevel?: string | null;
}): number {
  const normalizedNative = (params.nativeLanguage ?? '').trim().toLowerCase();
  const normalizedKnown = params.knownLanguages.map((value) =>
    value.trim().toLowerCase(),
  );

  const hasEnglish =
    normalizedNative === 'en' ||
    normalizedNative === 'english' ||
    normalizedKnown.includes('en') ||
    normalizedKnown.includes('english');

  let boost = 0;
  if (hasEnglish) {
    boost = 0.12;
  } else if (normalizedKnown.length >= 2) {
    boost = 0.04;
  } else {
    const advancedKnown = params.knownLanguageLevels.some((item) =>
      ['b2', 'c1', 'c2', 'advanced', 'fluent', 'native'].includes(
        item.level.trim().toLowerCase(),
      ),
    );
    if (advancedKnown) {
      boost = 0.04;
    }
  }

  if (!isEnglishLevelAboveB1(params.englishLevel)) {
    return Math.min(boost, 0.03);
  }
  return boost;
}
