/**
 * Default prompt for generating video comprehension tests and key vocabulary.
 */

export const DEFAULT_PROMPT_COMPREHENSION_TESTS = `You create an English learning assessment for a video: multiple-choice (grammar, vocabulary, comprehension), ONE open-ended summary question, AND a key vocabulary list.
Return ONLY valid JSON with this exact top-level shape (no extra keys): { "tests": [ exactly {{EXPECTED_TEST_COUNT}} items ], "keyVocabulary": [ exactly {{KEY_VOCAB_COUNT}} items ] }

=== tests (exactly {{EXPECTED_TEST_COUNT}}) ===
Include exactly ONE item with questionType "open" and category "open": ask the learner to describe in 2–3 sentences what the video was mainly about. No options or correctIndex for open.
Include exactly {{MCQ_COUNT}} items with questionType "multiple_choice". Each MCQ MUST be:
{"id":"t1","questionType":"multiple_choice","category":"grammar"|"vocabulary"|"comprehension","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}
Open item MUST be: {"id":"t_open","questionType":"open","category":"open","question":"... 2-3 sentences ...","explanation":"What a good answer should mention (short rubric for teachers/learners)."}

MCQ categories (strict counts among the 9 MCQs):
- 3 with category "grammar" (tense/aspect, articles, prepositions, agreement) — grounded in transcript or title/description.
- 3 with category "vocabulary" (word meaning in context, collocation, phrasal verb) — quote or paraphrase from transcript when available.
- 3 with category "comprehension" (detail, inference, main idea except the open summary).

Field "explanation" on MCQs: 1–3 sentences — why the correct option is right.
correctIndex is 0-based. Four options per MCQ.

PRIOR MISSES — retest 2–3 similar skills in NEW wording (never copy stems):
{{WEAK_SPOTS}}

LEARNER STUDYING PLAN (from profile — use when the transcript supports it; never invent video facts):
- Stated goal: {{LEARNING_GOAL}}
- Target time horizon: {{TIME_TO_ACHIEVE}}
- Interests / hobbies: {{HOBBIES}}
Apply: Prefer MCQs, the open-summary rubric, and key vocabulary items that help toward the stated goal when the clip content allows. Use hobbies as light thematic hooks only when the video touches related ideas. Shorter horizons → favour high-utility chunks and scenarios the learner can reuse soon; longer horizons → you may include slightly broader topic words still grounded in the transcript. Questions stay transcript-grounded.

=== keyVocabulary (exactly {{KEY_VOCAB_COUNT}} item) ===
Each: {"word":"...","definition":"...","example":"..."}
KEY VOCABULARY — LEVEL (mandatory):
{{VOCAB_STRETCH_INSTRUCTION}}
Target band label for glosses: {{VOCAB_TARGET_BAND}} (not the learner's comfort band).
- Words or multi-word chunks from the transcript (or title/description if no transcript).
- Prioritise items whose semantics map onto LEARNER_TOPIC_STRENGTHS (known topic areas): new labels should connect to those domains when the video supports it.
- Align several key vocabulary picks with LEARNER STUDYING PLAN (goal / interests) when transcript evidence exists; otherwise stay with neutral lesson language.
- Avoid only picking the easiest, below-target high-frequency words when the clip contains suitable stretch items; definitions/examples must suit the target band above.
- Generated in this same response as the tests.

LEARNER LEVEL (whole quiz difficulty / tone — MCQs can stay near this level; keyVocabulary follows the stretch rule above):
{{LEARNER_LEVEL}}

LEARNER SAVED VOCABULARY:
{{VOCABULARY_TERMS}}

VIDEO_THEME_TAGS:
{{VIDEO_THEMES}}

LEARNER_TOPIC_STRENGTHS:
{{THEME_STRENGTH}}

{{TRANSCRIPT_BLOCK}}

Video title: {{VIDEO_NAME}}
Description: {{VIDEO_DESCRIPTION}}`;
