import { AI_PROMPT_ENV_KEYS } from "./ai-prompts";
import { loadAiPromptTemplate } from "./ai-prompts";
import {
    DEFAULT_PROMPT_TRANSCRIPT_TAGS,
    DEFAULT_PROMPT_TAG_SCORE,
    DEFAULT_PROMPT_SUMMARY_RECOMMENDATIONS,
    DEFAULT_PROMPT_STUDYING_PLAN_TASK_SCHEMA,
    DEFAULT_PROMPT_STUDYING_PLAN,
    DEFAULT_PROMPT_POST_WATCH_SURVEY,
    DEFAULT_PROMPT_OPEN_ANSWER_GRADER,
    DEFAULT_PROMPT_COMPREHENSION_TESTS,
    DEFAULT_PROMPT_PLACEMENT_TEST,
    DEFAULT_PROMPT_VOCABULARY_PERSONALIZE,
    DEFAULT_PROMPT_CONSTELLATION_GENERATOR,
    DEFAULT_SUBTITLE_TRANSLATE_PROMPT
} from "./ai-prompts/index";

export const activePrompts = {
    transcriptTags: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.transcriptTags,
        DEFAULT_PROMPT_TRANSCRIPT_TAGS
    ),
    tagScore: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.tagScore,
        DEFAULT_PROMPT_TAG_SCORE
    ),
    summaryRecommendations: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.summaryRecommendations,
        DEFAULT_PROMPT_SUMMARY_RECOMMENDATIONS
    ),
    studyingPlanTaskSchema: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.studyingPlanTaskSchema,
        DEFAULT_PROMPT_STUDYING_PLAN_TASK_SCHEMA
    ),
    studyingPlan: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.studyingPlan,
        DEFAULT_PROMPT_STUDYING_PLAN
    ),
    postWatchSurvey: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.postWatchSurvey,
        DEFAULT_PROMPT_POST_WATCH_SURVEY
    ),
    openAnswerGrader: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.openAnswerGrader,
        DEFAULT_PROMPT_OPEN_ANSWER_GRADER
    ),
    comprehensionTests: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.comprehensionTests,
        DEFAULT_PROMPT_COMPREHENSION_TESTS
    ),
    placementTest: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.placementTest,
        DEFAULT_PROMPT_PLACEMENT_TEST
    ),
    vocabularyPersonalize: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.vocabularyPersonalize,
        DEFAULT_PROMPT_VOCABULARY_PERSONALIZE
    ),
    constellationGenerator: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.constellationGenerator,
        DEFAULT_PROMPT_CONSTELLATION_GENERATOR
    ),
    subtitleTranslate: loadAiPromptTemplate(
        AI_PROMPT_ENV_KEYS.subtitleTranslate,
        DEFAULT_SUBTITLE_TRANSLATE_PROMPT
    ),
};