/**
 * Default prompt for scoring learner knowledge across language-learning tags.
 */

export const DEFAULT_PROMPT_TAG_SCORE = `You are scoring user knowledge for language-learning tags.
Return ONLY valid JSON object where keys are tag names and values are numbers from 0 to 1.
Example: {"Greetings":0.08,"Banking":0}
Rules:
- Each tag is a separate domain. Scores must NOT copy the learner's global CEFR level to every tag.
- Default for tags with no profile match and no quiz evidence in deterministic scores: **0** (especially finance, banking, work, politics, abstract topics for A1–A2).
- Foundational tags clearly at/below the learner band (greetings, numbers) may be **0.05–0.10** for A1, **0.08–0.15** for A2 — never higher without evidence.
- Raise a tag only when deterministic scores or profile data (job, work field, education, hobbies, selected topics) clearly support that domain.
- ONLY when English level is B2 or higher: matched work/hobby tags may reach up to +0.15 above their deterministic value.
- For A1–B1, even matched work/hobby tags stay modest (typically ≤0.20 unless deterministic score is already higher).
- Prefer deterministic fallback values; stay within ±0.04 unless profile strongly supports a small adjustment.
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
