import {
  buildUserThemeTokens,
  userEnglishLevelToCefrUnit,
  userThemeMatchScore,
} from "src/content-recommendations/content-recommendation.scoring";

export type StudyingPlanTopicRef = {
  id: number;
  name: string;
};

export type CatalogTopicForPlan = {
  id: number;
  name: string;
  categoryName: string;
  complexity: number;
  tagNames: string[];
};

export type StudyingPlanTopicSelectionContext = {
  learningGoal: string;
  englishLevel: string;
  hobbies: string[];
  interests: string[];
  job: string | null;
  workField: string | null;
  education: string | null;
  tagNames: string[];
  selectedTopicIds: number[];
};

const TOPICS_PER_PHASE = 3;
const PHASE_COUNT_DEFAULT = 4;

function normalizeTopicName(name: string): string {
  return name.trim().toLowerCase();
}

function isTopicAlreadyUsed(
  topic: Pick<CatalogTopicForPlan, "id" | "name">,
  usedTopicIds: Set<number>,
  usedTopicNames: Set<string>,
): boolean {
  return (
    usedTopicIds.has(topic.id) ||
    usedTopicNames.has(normalizeTopicName(topic.name))
  );
}

function markTopicUsed(
  topic: Pick<CatalogTopicForPlan, "id" | "name">,
  usedTopicIds: Set<number>,
  usedTopicNames: Set<string>,
): void {
  usedTopicIds.add(topic.id);
  usedTopicNames.add(normalizeTopicName(topic.name));
}

/**
 * Ensures each topic id/name appears in at most one phase (first occurrence wins).
 */
export function dedupeTopicsAcrossPhases(
  topicsByPhase: StudyingPlanTopicRef[][],
): StudyingPlanTopicRef[][] {
  const usedTopicIds = new Set<number>();
  const usedTopicNames = new Set<string>();
  return topicsByPhase.map((phaseTopics) => {
    const deduped: StudyingPlanTopicRef[] = [];
    for (const topic of phaseTopics) {
      if (isTopicAlreadyUsed(topic, usedTopicIds, usedTopicNames)) {
        continue;
      }
      deduped.push(topic);
      markTopicUsed(topic, usedTopicIds, usedTopicNames);
    }
    return deduped;
  });
}

function complexityIdealForPhase(
  userCefrUnit: number,
  phaseIndex: number,
): number {
  const base = 1 + userCefrUnit * 1.4;
  return base + phaseIndex * 0.35;
}

function complexityFitScore(topicComplexity: number, ideal: number): number {
  const delta = Math.abs(topicComplexity - ideal);
  return Math.max(0, 1 - delta / 1.25);
}

function scoreTopicForPhase(
  topic: CatalogTopicForPlan,
  phaseIndex: number,
  context: StudyingPlanTopicSelectionContext,
  userTokens: Set<string>,
  idealComplexity: number,
  selectedTopicIdSet: Set<number>,
): number {
  const themeTags = [
    topic.name,
    topic.categoryName,
    ...topic.tagNames,
  ];
  const themeMatch = userThemeMatchScore(themeTags, userTokens);
  const complexityFit = complexityFitScore(topic.complexity, idealComplexity);
  const selectedBoost = selectedTopicIdSet.has(topic.id) ? 1 : 0;
  const foundationalBoost =
    phaseIndex === 0 && topic.categoryName.toLowerCase().includes("foundational") ?
      0.25
    : 0;
  const stretchBoost =
    phaseIndex >= 2 && topic.complexity >= idealComplexity ? 0.1 : 0;
  return (
    themeMatch * 0.45 +
    complexityFit * 0.35 +
    selectedBoost * 0.15 +
    foundationalBoost +
    stretchBoost
  );
}

/**
 * Picks catalogue topics for each studying-plan phase from the DB topic list.
 * Topics are scored against the learner profile and spread across phases without repeats.
 */
export function selectTopicsForPhases(
  topics: CatalogTopicForPlan[],
  context: StudyingPlanTopicSelectionContext,
  phaseCount = PHASE_COUNT_DEFAULT,
  topicsPerPhase = TOPICS_PER_PHASE,
): StudyingPlanTopicRef[][] {
  if (topics.length === 0 || phaseCount <= 0) {
    return Array.from({ length: Math.max(0, phaseCount) }, () => []);
  }
  const userTokens = buildUserThemeTokens({
    hobbies: context.hobbies,
    interests: context.interests,
    workField: context.workField,
    education: context.education,
    job: context.job,
    selectedTopicNames: topics
      .filter((t) => context.selectedTopicIds.includes(t.id))
      .map((t) => t.name),
    strongTopicTagNames: context.tagNames,
    favoriteGenreNames: [],
  });
  for (const tag of context.tagNames) {
    userTokens.add(tag.trim().toLowerCase());
  }
  const goalTokens = context.learningGoal
    .split(/[\s,;/]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 2);
  for (const token of goalTokens) {
    userTokens.add(token);
  }
  const selectedTopicIdSet = new Set(context.selectedTopicIds);
  const userCefrUnit = userEnglishLevelToCefrUnit(context.englishLevel);
  const usedTopicIds = new Set<number>();
  const usedTopicNames = new Set<string>();
  const result: StudyingPlanTopicRef[][] = [];
  for (let phaseIndex = 0; phaseIndex < phaseCount; phaseIndex += 1) {
    const ideal = complexityIdealForPhase(userCefrUnit, phaseIndex);
    const ranked = topics
      .map((topic) => ({
        topic,
        score: scoreTopicForPhase(
          topic,
          phaseIndex,
          context,
          userTokens,
          ideal,
          selectedTopicIdSet,
        ),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.topic.complexity - b.topic.complexity;
      });
    const picked: StudyingPlanTopicRef[] = [];
    for (const { topic } of ranked) {
      if (picked.length >= topicsPerPhase) {
        break;
      }
      if (isTopicAlreadyUsed(topic, usedTopicIds, usedTopicNames)) {
        continue;
      }
      picked.push({ id: topic.id, name: topic.name });
      markTopicUsed(topic, usedTopicIds, usedTopicNames);
    }
    if (picked.length < topicsPerPhase) {
      for (const topic of topics) {
        if (picked.length >= topicsPerPhase) {
          break;
        }
        if (isTopicAlreadyUsed(topic, usedTopicIds, usedTopicNames)) {
          continue;
        }
        picked.push({ id: topic.id, name: topic.name });
        markTopicUsed(topic, usedTopicIds, usedTopicNames);
      }
    }
    result.push(picked);
  }
  return dedupeTopicsAcrossPhases(result);
}

export function formatCatalogTopicsForPrompt(
  topics: CatalogTopicForPlan[],
): string {
  return topics
    .slice(0, 80)
    .map(
      (t) =>
        `- id=${t.id} | ${t.name} (${t.categoryName}, complexity ${t.complexity.toFixed(1)}; tags: ${t.tagNames.slice(0, 6).join(", ") || "—"})`,
    )
    .join("\n");
}

export function formatPhaseTopicsForPrompt(
  topicsByPhase: StudyingPlanTopicRef[][],
): string {
  return topicsByPhase
    .map((topics, i) => {
      const names = topics.map((t) => t.name).join(", ");
      return `  Phase ${i + 1}: ${names || "(none)"}`;
    })
    .join("\n");
}
