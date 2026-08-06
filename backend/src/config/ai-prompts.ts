/**
 * Loads AI prompt templates from environment variables with in-code defaults.
 *
 * In `.env`, set keys from {@link AI_PROMPT_ENV_KEYS}; use `\\n` for line breaks.
 * Templates may include `{{PLACEHOLDER}}` tokens replaced at runtime.
 */

import { AI_PROMPT_ENV_KEYS } from "./ai-prompts/env-keys";

export { AI_PROMPT_ENV_KEYS } from "./ai-prompts/env-keys";

/**
 * Reads a prompt template from `process.env[envKey]` or falls back to `defaultTemplate`.
 */
export function loadAiPromptTemplate(
  envKey: string,
  defaultTemplate: string,
): string {
  const raw = process.env[envKey]?.trim();
  if (!raw) {
    return defaultTemplate;
  }
  return raw.replace(/\\n/g, "\n");
}

/**
 * Replaces `{{KEY}}` placeholders in a template (global, all occurrences).
 */
/**
 * Replaces `{{KEY}}` placeholders in a template (global, all occurrences).
 */
export function applyAiPromptPlaceholders(
  template: string,
  vars: Readonly<Record<string, string>>,
): string {
  // Добавляем защиту от undefined из-за кривых импортов
  if (typeof template !== "string") {
    console.error("🚨 CRITICAL ERROR: template is undefined! Проблема в порядке импортов (index.ts).");
    return "";
  }

  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, String(value));
  }
  return out;
}

/**
 * Loads a template by env key + default, then applies placeholders.
 */
export function buildAiPrompt(
  envKey: string,
  defaultTemplate: string,
  vars: Readonly<Record<string, string>>,
): string {
  return applyAiPromptPlaceholders(
    loadAiPromptTemplate(envKey, defaultTemplate),
    vars,
  );
}
