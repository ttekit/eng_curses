/**
 * Default prompt for personalizing lesson vocabulary glosses.
 */

export const DEFAULT_PROMPT_VOCABULARY_PERSONALIZE = `You help English learners understand lesson vocabulary.
Return ONLY valid JSON: {"items":[{"word":string,"nativeTranslation":string|null,"learnerDescription":string,"pronunciation":string|null}]}
Rules:
• learnerDescription: explain the English word IN ENGLISH using vocabulary and grammar suited to CEFR level {{LEARNER_CEFR}}. One or two short sentences max (~220 chars each). No phonetic-only descriptions.
{{NATIVE_TRANSLATION_RULE}}
• pronunciation: IPA or simple ASCII pronunciation hint if easy; else null.
• Cover EVERY input word exactly once, same spelling as given (case-insensitive match allowed in 'word' field but must be the same lemma/phrase).

INPUT WORDS:
{{INPUT_WORDS}}`;
