/**
 * Environment variable keys for AI prompt template overrides.
 */

export const AI_PROMPT_ENV_KEYS = {
  transcriptTags: "GEMINI_PROMPT_TRANSCRIPT_TAGS",
  tagScore: "GEMINI_PROMPT_TAG_SCORE",
  summaryRecommendations: "GEMINI_PROMPT_SUMMARY_RECOMMENDATIONS",
  studyingPlan: "GEMINI_PROMPT_STUDYING_PLAN",
  studyingPlanTaskSchema: "GEMINI_PROMPT_STUDYING_PLAN_TASK_SCHEMA",
  postWatchSurvey: "GEMINI_PROMPT_POST_WATCH_SURVEY",
  openAnswerGrader: "GEMINI_PROMPT_OPEN_ANSWER_GRADER",
  comprehensionTests: "GEMINI_PROMPT_COMPREHENSION_TESTS",
  placementTest: "GEMINI_PROMPT_PLACEMENT_TEST",
  vocabularyPersonalize: "GEMINI_PROMPT_VOCABULARY_PERSONALIZE",
  constellationGenerator: "GEMINI_PROMPT_CONSTELLATION_GENERATOR",
  subtitleTranslate: "SUBTITLE_TRANSLATE_PROMPT",
} as const;