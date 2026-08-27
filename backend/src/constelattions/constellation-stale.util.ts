import {
  is_star_content_ready,
  uses_lazy_plan_system,
} from "./star-content.util";
import { normalize_star_questions } from "./test-question.validator";

type StarRecord = {
  readonly type: string;
  readonly metadata: unknown;
};

type ConstellationRecord = {
  readonly id: number;
  readonly kind: string | null;
  readonly stars: readonly StarRecord[];
};

const QUIZ_STAR_TYPES = new Set(["GRAMMAR", "READING", "TEST"]);

function read_metadata(metadata: unknown): Record<string, unknown> {
  if (typeof metadata === "object" && metadata !== null) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

/**
 * Returns true when a stored constellation should be regenerated via Gemini.
 */
export function constellation_needs_regeneration(
  constellation: ConstellationRecord,
): boolean {
  if (constellation.kind === "FOUNDATION") {
    return true;
  }
  if (uses_lazy_plan_system(constellation.stars)) {
    return false;
  }
  for (const star of constellation.stars) {
    const metadata = read_metadata(star.metadata);
    const hasLegacyQuiz =
      Array.isArray(metadata.quiz) && metadata.quiz.length > 0;
    if (hasLegacyQuiz) {
      return true;
    }
    if (!QUIZ_STAR_TYPES.has(star.type)) {
      continue;
    }
    if (!is_star_content_ready(star.type, metadata)) {
      return true;
    }
    const questions = normalize_star_questions(metadata);
    const minQuestions = star.type === "READING" ? 4 : 5;
    if (questions.length < minQuestions) {
      return true;
    }
  }
  return false;
}
