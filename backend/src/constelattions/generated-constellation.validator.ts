import { normalize_star_questions } from "./test-question.validator";
import type { GeneratedConstellation, GeneratedStar } from "./constellation-gemini.client";

type ValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly reason: string };

/**
 * Validates a lightweight constellation plan (no lesson content yet).
 */
export function validate_constellation_plan(
  generated: GeneratedConstellation | null | undefined,
): ValidationResult {
  if (!generated?.stars?.length) {
    return { valid: false, reason: "Missing stars array" };
  }
  if (generated.stars.length < 8 || generated.stars.length > 10) {
    return {
      valid: false,
      reason: `Star count must be 8–10, got ${generated.stars.length}`,
    };
  }
  if (!generated.constellationName?.trim()) {
    return { valid: false, reason: "Missing constellationName" };
  }
  const ids = new Set<string>();
  for (const star of generated.stars) {
    if (!star.id?.trim() || !star.name?.trim()) {
      return { valid: false, reason: "Star missing id or name" };
    }
    if (ids.has(star.id)) {
      return { valid: false, reason: `Duplicate star id: ${star.id}` };
    }
    ids.add(star.id);
    if (star.type === "VIDEO") {
      return { valid: false, reason: "VIDEO stars are not allowed" };
    }
  }
  const roots = generated.stars.filter((star) => star.prerequisiteIds.length === 0);
  if (roots.length !== 1) {
    return { valid: false, reason: `Expected one root star, got ${roots.length}` };
  }
  return { valid: true };
}

/**
 * Validates full content metadata for a single star.
 */
export function validate_star_content_metadata(
  starType: string,
  metadata: Record<string, unknown> | null | undefined,
): ValidationResult {
  if (!metadata) {
    return { valid: false, reason: "Missing metadata" };
  }
  if (Array.isArray(metadata.quiz) && metadata.quiz.length > 0) {
    return { valid: false, reason: "Legacy metadata.quiz is not allowed" };
  }
  if (starType === "PHRASE") {
    const phrases = metadata.phrases;
    if (!Array.isArray(phrases) || phrases.length < 5) {
      return { valid: false, reason: "PHRASE needs at least 5 phrases" };
    }
    return { valid: true };
  }
  if (starType === "GRAMMAR") {
    const rule = typeof metadata.rule === "string" ? metadata.rule : "";
    const examples = Array.isArray(metadata.examples) ? metadata.examples : [];
    const questions = normalize_star_questions(metadata);
    if (rule.length < 200) {
      return { valid: false, reason: "GRAMMAR rule too short" };
    }
    if (examples.length < 5) {
      return { valid: false, reason: "GRAMMAR needs at least 5 examples" };
    }
    if (questions.length < 5) {
      return { valid: false, reason: "GRAMMAR needs at least 5 questions" };
    }
    return { valid: true };
  }
  if (starType === "READING") {
    const text = typeof metadata.text === "string" ? metadata.text : "";
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const questions = normalize_star_questions(metadata);
    if (wordCount < 60) {
      return { valid: false, reason: "READING text too short" };
    }
    if (questions.length < 4) {
      return { valid: false, reason: "READING needs at least 4 questions" };
    }
    return { valid: true };
  }
  if (starType === "TEST") {
    if (normalize_star_questions(metadata).length < 5) {
      return { valid: false, reason: "TEST needs at least 5 questions" };
    }
    return { valid: true };
  }
  if (starType === "VIDEO") {
    const summary = typeof metadata.summary === "string" ? metadata.summary : "";
    if (summary.length < 20) {
      return { valid: false, reason: "VIDEO needs summary text" };
    }
    return { valid: true };
  }
  return { valid: true };
}

export function validate_generated_constellation(
  generated: GeneratedConstellation | null | undefined,
): ValidationResult {
  return validate_constellation_plan(generated);
}

export type { GeneratedStar };
