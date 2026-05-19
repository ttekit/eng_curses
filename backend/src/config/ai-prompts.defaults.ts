/**
 * Default AI prompt templates (used when env vars are unset).
 * In .env, override with the same keys; use \\n for newlines.
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
} as const;

export const DEFAULT_PROMPT_TRANSCRIPT_TAGS = `You describe English learning video content from its transcript only.
Return ONLY valid JSON with this exact shape (no extra keys):
{"systemTags":["B1"],"userTags":["Action","Comedy"],"complexity":5}
Rules:
- systemTags: 1 to 3 items. Each value MUST be copied exactly from this list (spelling, case): {{SYSTEM_LIST}}. Choose the CEFR level that best matches the language difficulty of what is SPOKEN (vocabulary, grammar, speed).
{{USER_TAG_RULES}}
- complexity: integer 1 to 10 = how hard it is for a typical intermediate learner to *process* the video (density, speed, abstract ideas, accent). 1 = very easy, 10 = very demanding.
Video title: {{VIDEO_TITLE}}
Transcript:
{{TRANSCRIPT}}`;

export const DEFAULT_PROMPT_TAG_SCORE = `You are scoring user knowledge for language-learning tags.
Return ONLY valid JSON object where keys are tag names and values are numbers from 0 to 1.
Example: {"Greetings":0.4,"Travel":0.8}
Tags: {{TAGS}}
English level: {{ENGLISH_LEVEL}}
Native language: {{NATIVE_LANGUAGE}}
Known languages: {{KNOWN_LANGUAGES}}
Known language levels: {{KNOWN_LANGUAGE_LEVELS}}
Education: {{EDUCATION}}
Work field: {{WORK_FIELD}}
Job: {{JOB}}
Hobbies: {{HOBBIES}}
Selected topics: {{SELECTED_TOPICS}}
Deterministic fallback scores: {{DETERMINISTIC_SCORES}}`;

export const DEFAULT_PROMPT_SUMMARY_RECOMMENDATIONS = `You are a supportive English coach. The learner finished a video comprehension and grammar test.
Return ONLY valid JSON (no markdown) with this exact shape:
{"headline":"short celebratory or constructive title (max 80 chars)",
"summary":"2-3 sentences on how they did overall and what the scores suggest",
"focusWords":["3-8","real","vocabulary","or","phrases","to","practise","next"],
"nextSteps":["3-5","concrete","actionable","short","items"],
"encouragement":"one warm sentence"}
focusWords: prefer words that relate to the video theme or the learner's saved words; if the list is empty, still suggest common useful words for their apparent level.
nextSteps: mix review of weak areas (grammar vs comprehension) with practical habits (e.g. re-watch a scene, say sentences aloud, flashcards).
Video: "{{VIDEO_NAME}}"
Stated / profile level: {{LEARNER_CEFR}}
Saved vocabulary the system used in test design (may be empty): {{VOCABULARY_TERMS}}
Results: {{CORRECT}}/{{TOTAL}} ({{PERCENTAGE}}%) overall.
Comprehension: {{COMPREHENSION_CORRECT}}/{{COMPREHENSION_TOTAL}}.
Grammar: {{GRAMMAR_CORRECT}}/{{GRAMMAR_TOTAL}}.`;

export const DEFAULT_PROMPT_STUDYING_PLAN_TASK_SCHEMA = `Each phase MUST include a non-empty **tasks** array. Each task object MUST have **id** (short slug string) and **kind** one of:
  distinct_videos_passed: { id, kind, minCount (int >= 1), minScorePct (number 0–100), scope: "phase" | "cumulative" }
  streak_days: { id, kind, minConsecutive (int >= 1) }
  vocabulary_terms_added: { id, kind, minCount (int >= 1), scope: "phase" }
  watch_time_minutes: { id, kind, minMinutes (int >= 1), scope: "phase" }
  min_phase_calendar_days: { id, kind, minDays (int >= 1) }
Every phase should include at least one **distinct_videos_passed**, **streak_days**, **vocabulary_terms_added**, **watch_time_minutes**, and **min_phase_calendar_days** task matching the numeric hints for that phase.`;

export const DEFAULT_PROMPT_STUDYING_PLAN = `You write a structured English learning roadmap for one adult learner using video lessons with comprehension checks (multiple choice + short summary).
Return ONLY valid JSON (no markdown) with this exact top-level shape: { "phases": [ exactly {{PHASE_COUNT}} objects ], "weeklyHabits": [ exactly {{WEEKLY_HABITS_COUNT}} strings ] }. Use the key name **weeklyHabits** exactly.

Each phase object MUST have: "title" (string, <= 90 chars), "summary" (string, 1-2 sentences), "actions" (array of 3-5 short actionable strings), "passConditions" (array of 5-7 strings), "tasks" (array of structured task objects — see TASK SCHEMA below).

TASK SCHEMA:
{{TASK_SCHEMA}}

{{TIMELINE_BLOCK}}

{{PASS_BLOCK}}

Suggested per-phase floors (meet or exceed; round sensibly but do not go below):
{{PHASE_HINT_LINES}}

Phases should progress logically: 1) build habit, 2) stretch input, 3) apply/output, 4) sustain until horizon.
weeklyHabits: three concrete weekly rhythms (catalog videos, quizzes, vocabulary review), scaled to tier and horizon length.

Learner goal: {{LEARNING_GOAL}}
Time horizon (verbatim): {{TIME_HORIZON}}
CEFR / level (raw): {{ENGLISH_LEVEL}}
Hobbies / interests: {{HOBBIES}}`;

export const DEFAULT_PROMPT_POST_WATCH_SURVEY = `You create a short post-video survey for English language learners.
Return ONLY valid JSON: {"questions":[...]} with exactly 4 items.
Each question must be an object: {"id":"q1","type":"likert"|"short_text"|"mcq","prompt":"...","options":[]}
For type "likert" use 5 options: "Strongly disagree","Disagree","Neutral","Agree","Strongly agree".
For "mcq" use 3–4 short English options in "options".
For "short_text" omit options or use empty array [].
Questions should check understanding and reflection; reference the video theme only in general terms.
Video title: {{VIDEO_NAME}}
Description: {{VIDEO_DESCRIPTION}}`;

export const DEFAULT_PROMPT_OPEN_ANSWER_GRADER = `You review a short English learner summary (about 2–3 sentences) of a video. Use an IELTS-style coaching tone: warm, clear, specific.
Return ONLY valid JSON with this exact shape: {"score": integer, "feedback": string}
Field "score": integer from 1 to 10 inclusive. Decide using BOTH:
  • How well the answer reflects the VIDEO (main idea and at least some concrete connection to the transcript/context — penalize off-topic or generic fluff).
  • Grammar and clarity appropriate to the learner level — minor errors can still score highly if meaning and relevance are strong; many serious errors or incoherence lower the score.
  Rough guide: 1–3 = largely irrelevant or unreadable; 4–6 = partial relevance or weak language; {{PASS_MIN_SCORE}}–10 = clearly about this video with acceptable learner English.
Field "feedback": One cohesive paragraph in English (aim under ~170 words). Order your points naturally and include:
  • Brief comments on relevance to the video (what landed well / what's missing vs the content).
  • Specific grammar or wording fixes (examples at their level, not abstract rules only).
  • One strength, brief encouragement.
  • One or two practical tips for memorizing new vocabulary from the lesson.
  • One grammar-study tip tied to mistakes in their summary.
Do NOT include any other top-level JSON keys.
Do not name the product or API. Do not repeat the rubric verbatim.

{{PROFILE_BLOCK}}
Video title: {{VIDEO_NAME}}
Description: {{VIDEO_DESCRIPTION}}
Learner level hint: {{LEARNER_CEFR}}

VIDEO / CONTEXT:
{{TRANSCRIPT_CHUNK}}

LEARNER ANSWER:
{{LEARNER_ANSWER}}`;

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

export const DEFAULT_PROMPT_PLACEMENT_TEST = `You craft a timed multistep placement test rendered in an SPA iframe (one screen per item; options are touch targets). Learner:
- Display name hint (do not repeat verbatim personal data): {{LEARNER_NAME}}
Output ONLY a JSON object — no prose, fences, BOM, markdown. Shape:
{"questions":[{"id":"qTEMP","type":"grammar","themeId":"workplace","prompt":"…","options":["…","…","…","…"],"correctIndex":0}]}
Hard rules:
- Exactly {{TARGET_COUNT}} questions.
- Type counts: {{GRAMMAR_COUNT}} "grammar", {{VOCAB_COUNT}} "vocabulary" (spell exactly).
- Each prompt is one clear standalone item (sentence completion, cloze gap, synonym, collocation, error correction scenario). Prompt must not reveal the letter of the answer.
- Four options exactly; each ≤ 120 chars; natural English; duplicates forbidden.
- Do NOT prefix options with letters, numbers like "A." or bullets — plain answer text only.
- Exactly one objectively correct answer; correctIndex 0..3 references options array.
- themeId optional string from catalogue snapshot; fallback "daily_life".
- ids temporarily any short string — server will canonicalize.
- Calibrate roughly to CEFR prior: {{CEFR_HINT}}.
- Theme knowledge tags for tone (generic scenarios only): {{KNOWLEDGE_TAGS}}
Theme catalogue (JSON): {{THEME_CATALOG}}`;

export const DEFAULT_PROMPT_VOCABULARY_PERSONALIZE = `You help English learners understand lesson vocabulary.
Return ONLY valid JSON: {"items":[{"word":string,"nativeTranslation":string|null,"learnerDescription":string,"pronunciation":string|null}]}
Rules:
• learnerDescription: explain the English word IN ENGLISH using vocabulary and grammar suited to CEFR level {{LEARNER_CEFR}}. One or two short sentences max (~220 chars each). No phonetic-only descriptions.
{{NATIVE_TRANSLATION_RULE}}
• pronunciation: IPA or simple ASCII pronunciation hint if easy; else null.
• Cover EVERY input word exactly once, same spelling as given (case-insensitive match allowed in 'word' field but must be the same lemma/phrase).

INPUT WORDS:
{{INPUT_WORDS}}`;
