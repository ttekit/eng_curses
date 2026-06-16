import type { RecommendationScoreParts } from "./content-recommendation.scoring";

const LEVEL_SCALE = 1_000_000;
const TOPIC_SCALE = 10_000;
const GENRE_SCALE = 100;

function compareScorePart(left: number, right: number): number {
  if (right > left) {
    return 1;
  }
  if (right < left) {
    return -1;
  }
  return 0;
}

/**
 * Lexicographic ranking: CEFR level fit, then active phase topics, then genres.
 */
export function compareRecommendationPriority(
  left: RecommendationScoreParts,
  right: RecommendationScoreParts,
): number {
  const byLevel = compareScorePart(left.cefr, right.cefr);
  if (byLevel !== 0) {
    return byLevel;
  }
  const byPhaseTopics = compareScorePart(left.phaseTopics, right.phaseTopics);
  if (byPhaseTopics !== 0) {
    return byPhaseTopics;
  }
  const byGenres = compareScorePart(left.genres, right.genres);
  if (byGenres !== 0) {
    return byGenres;
  }
  const byTopicKnowledge = compareScorePart(
    left.topicKnowledge,
    right.topicKnowledge,
  );
  if (byTopicKnowledge !== 0) {
    return byTopicKnowledge;
  }
  const byThemes = compareScorePart(left.themes, right.themes);
  if (byThemes !== 0) {
    return byThemes;
  }
  return compareScorePart(left.complexity, right.complexity);
}

/** Encodes priority tiers into a single sortable score for API responses. */
export function encodePriorityScore(parts: RecommendationScoreParts): number {
  return (
    parts.cefr * LEVEL_SCALE +
    parts.phaseTopics * TOPIC_SCALE +
    parts.genres * GENRE_SCALE +
    parts.topicKnowledge * 10 +
    parts.themes
  );
}
