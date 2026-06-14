/**
 * Default prompt for generating a timed placement test.
 */

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
