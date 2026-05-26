import { expectedCefrLevelForPhase } from "./studying-plan-cefr.util";
import type { HorizonBudget } from "./studying-plan-horizon.util";
import type { StoredStudyingPlanPhaseV2 } from "./studying-plan-json.util";
import type { CoarseLevelTier } from "./studying-plan-level.util";
import { dedupeTopicsAcrossPhases } from "./studying-plan-topic-selection.util";
import type { StudyingPlanTopicRef } from "./studying-plan-topic-selection.util";
import { buildTransitionPassConditions } from "./studying-plan-transition-conditions.util";
import { PHASE_FINAL_TEST_MIN_SCORE_PCT } from "./studying-plan.constants";

/**
 * Applies DB topics, expected CEFR level, and transition rules to each phase.
 */
export function enrichStudyingPlanPhases(options: {
  phases: StoredStudyingPlanPhaseV2[];
  topicsByPhase: StudyingPlanTopicRef[][];
  englishLevel: string;
  learningGoal: string;
  budget: HorizonBudget;
  tier: CoarseLevelTier;
}): StoredStudyingPlanPhaseV2[] {
  const { phases, topicsByPhase, englishLevel, learningGoal, budget, tier } =
    options;
  const phaseCount = Math.max(phases.length, 4);
  const uniqueTopicsByPhase = dedupeTopicsAcrossPhases(topicsByPhase);
  const mergedTopicsByPhase = phases.map((phase, phaseIndex) => {
    const assigned = uniqueTopicsByPhase[phaseIndex] ?? [];
    return assigned.length > 0 ? assigned : (phase.topics ?? []);
  });
  const globallyUniqueTopicsByPhase =
    dedupeTopicsAcrossPhases(mergedTopicsByPhase);
  return phases.map((phase, phaseIndex) => {
    const topics = globallyUniqueTopicsByPhase[phaseIndex] ?? [];
    const expectedLevel =
      phase.expectedLevel?.trim() ||
      expectedCefrLevelForPhase(englishLevel, phaseIndex, phaseCount);
    const transitionCondition =
      phase.transitionCondition?.trim() ||
      buildTransitionPassConditions({
        phaseIndex,
        phaseCount,
        budget,
        tier,
        learningGoal,
        expectedLevel,
        topics,
      }).join(" ");
    const passConditions = buildTransitionPassConditions({
      phaseIndex,
      phaseCount,
      budget,
      tier,
      learningGoal,
      expectedLevel,
      topics,
    });
    const tasks = [
      ...phase.tasks.filter((t) => t.kind !== "phase_final_test_passed"),
      ...(phaseIndex < phaseCount - 1 ?
        [
          {
            id: `p${phaseIndex}-final-test`,
            kind: "phase_final_test_passed" as const,
            minScorePct: PHASE_FINAL_TEST_MIN_SCORE_PCT,
          },
        ]
      : []),
    ];
    return {
      ...phase,
      topics,
      expectedLevel,
      transitionCondition,
      passConditions,
      tasks,
    };
  });
}
