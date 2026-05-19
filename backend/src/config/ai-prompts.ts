/**
 * Loads AI prompt templates from environment variables with in-code defaults.
 *
 * In `.env`, set keys from {@link AI_PROMPT_ENV_KEYS}; use `\\n` for line breaks.
 * Templates may include `{{PLACEHOLDER}}` tokens replaced at runtime.
 */

import { AI_PROMPT_ENV_KEYS } from "./ai-prompts.defaults";

export { AI_PROMPT_ENV_KEYS } from "./ai-prompts.defaults";

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
export function applyAiPromptPlaceholders(
  template: string,
  vars: Readonly<Record<string, string>>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value);
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
