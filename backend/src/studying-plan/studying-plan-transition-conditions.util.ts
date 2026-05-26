import {
  DISTINCT_PASSED_LESSONS_PER_PHASE_STEP,
  PHASE_FINAL_TEST_MIN_SCORE_PCT,
} from "./studying-plan.constants";
import type { HorizonBudget } from "./studying-plan-horizon.util";
import {
  streakTargetForPhase,
  videosPassedPlanTargetForPhase,
  vocabularyTargetForPhase,
  type CoarseLevelTier,
} from "./studying-plan-level.util";
import type { StudyingPlanTopicRef } from "./studying-plan-topic-selection.util";

/**
 * Human-readable bullets shown under “To advance to the next phase”.
 */
export function buildTransitionPassConditions(options: {
  phaseIndex: number;
  phaseCount: number;
  budget: HorizonBudget;
  tier: CoarseLevelTier;
  learningGoal: string;
  expectedLevel: string;
  topics: StudyingPlanTopicRef[];
}): string[] {
  const {
    phaseIndex,
    phaseCount,
    budget,
    tier,
    expectedLevel,
    topics,
  } = options;
  const streak = streakTargetForPhase(phaseIndex, budget.structuredStudyWeeks);
  const videos = videosPassedPlanTargetForPhase(phaseIndex);
  const words = vocabularyTargetForPhase(tier, phaseIndex);
  const topicNames =
    topics.length > 0 ?
      topics.map((t) => t.name).join(", ")
    : "catalog lessons aligned with your profile";
  const isLastPhase = phaseIndex >= phaseCount - 1;
  if (isLastPhase) {
    return [];
  }
  return [
    `Pass **${DISTINCT_PASSED_LESSONS_PER_PHASE_STEP} distinct** videos at **≥70%** (depth target **${videos}**).`,
    `Reach a **${streak}-day** study streak at least once.`,
    `Save **~${words}** new words from lessons.`,
    `Make meaningful progress on: **${topicNames}**.`,
    `Pass the **phase final test** at **≥${PHASE_FINAL_TEST_MIN_SCORE_PCT}%** (grammar & vocabulary for this phase at **${expectedLevel}**).`,
  ];
}
