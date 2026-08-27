/**
 * Default AI prompt templates (used when env vars are unset).
 * In .env, override with keys from {@link AI_PROMPT_ENV_KEYS}; use \n for newlines.
 */

export { AI_PROMPT_ENV_KEYS } from "./env-keys";
export { DEFAULT_PROMPT_TRANSCRIPT_TAGS } from "./transcript-tags.prompt";
export { DEFAULT_PROMPT_TAG_SCORE } from "./tag-score.prompt";
export { DEFAULT_PROMPT_SUMMARY_RECOMMENDATIONS } from "./summary-recommendations.prompt";
export { DEFAULT_PROMPT_STUDYING_PLAN_TASK_SCHEMA } from "./studying-plan-task-schema.prompt";
export { DEFAULT_PROMPT_STUDYING_PLAN } from "./studying-plan.prompt";
export { DEFAULT_PROMPT_POST_WATCH_SURVEY } from "./post-watch-survey.prompt";
export { DEFAULT_PROMPT_OPEN_ANSWER_GRADER } from "./open-answer-grader.prompt";
export { DEFAULT_PROMPT_COMPREHENSION_TESTS } from "./comprehension-tests.prompt";
export { DEFAULT_PROMPT_PLACEMENT_TEST } from "./placement-test.prompt";
export { DEFAULT_PROMPT_VOCABULARY_PERSONALIZE } from "./vocabulary-personalize.prompt";
export { DEFAULT_PROMPT_CONSTELLATION_GENERATOR } from "./constellation-generator.prompt";
export { DEFAULT_PROMPT_CONSTELLATION_PLAN } from "./constellation-plan.prompt";
export { DEFAULT_PROMPT_STAR_CONTENT } from "./star-content.prompt";
export { DEFAULT_SUBTITLE_TRANSLATE_PROMPT } from "./subtitle-translate.prompt";