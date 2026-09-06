import { normalize_star_questions } from "./test-question.validator";

export const StarContentStatus = {
  PENDING: "pending",
  GENERATING: "generating",
  READY: "ready",
} as const;

export type StarContentStatusValue =
  (typeof StarContentStatus)[keyof typeof StarContentStatus];

const QUIZ_TYPES = new Set(["GRAMMAR", "READING", "TEST"]);

export function read_star_metadata(
  metadata: unknown,
): Record<string, unknown> {
  if (typeof metadata === "object" && metadata !== null) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export function get_content_status(
  metadata: Record<string, unknown>,
): StarContentStatusValue {
  const status = metadata.contentStatus;
  if (status === StarContentStatus.READY) {
    return StarContentStatus.READY;
  }
  if (status === StarContentStatus.GENERATING) {
    return StarContentStatus.GENERATING;
  }
  return StarContentStatus.PENDING;
}

export function is_star_content_ready(
  starType: string,
  metadata: unknown,
): boolean {
  const record = read_star_metadata(metadata);
  if (get_content_status(record) === StarContentStatus.READY) {
    return true;
  }
  if (starType === "VIDEO") {
    return typeof record.summary === "string" && record.summary.length > 20;
  }
  if (starType === "PHRASE") {
    return Array.isArray(record.phrases) && record.phrases.length >= 5;
  }
  if (starType === "GRAMMAR") {
    const rule = typeof record.rule === "string" ? record.rule : "";
    const examples = Array.isArray(record.examples) ? record.examples : [];
    const questions = normalize_star_questions(record);
    return rule.length >= 200 && examples.length >= 5 && questions.length >= 5;
  }
  if (starType === "READING") {
    const text = typeof record.text === "string" ? record.text : "";
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const questions = normalize_star_questions(record);
    return wordCount >= 60 && questions.length >= 4;
  }
  if (starType === "TEST") {
    return normalize_star_questions(record).length >= 5;
  }
  return false;
}

export function build_plan_metadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const base = metadata ?? {};
  return {
    canDo: typeof base.canDo === "string" ? base.canDo : "",
    introducedLemmas: Array.isArray(base.introducedLemmas) ? base.introducedLemmas : [],
    recycledLemmas: Array.isArray(base.recycledLemmas) ? base.recycledLemmas : [],
    contentStatus: StarContentStatus.PENDING,
  };
}

export function merge_star_content_metadata(
  planMetadata: Record<string, unknown>,
  generatedMetadata: Record<string, unknown>,
): Record<string, unknown> {
  const { quiz: _legacyQuiz, contentStatus: _oldStatus, ...generated } =
    generatedMetadata;
  return {
    ...planMetadata,
    ...generated,
    contentStatus: StarContentStatus.READY,
  };
}

export function uses_lazy_plan_system(
  stars: readonly { readonly metadata: unknown }[],
): boolean {
  return stars.some((star) => {
    const record = read_star_metadata(star.metadata);
    return record.contentStatus !== undefined;
  });
}

export function is_quiz_star_type(starType: string): boolean {
  return QUIZ_TYPES.has(starType);
}
