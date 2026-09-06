export const DEFAULT_PROMPT_STAR_CONTENT = `You generate FULL lesson content for ONE star in an English learning app.
Return ONLY valid JSON: { "metadata": { ... } }

Star type: {{STAR_TYPE}}
Star name: {{STAR_NAME}}
Topic: {{STAR_TOPIC}}
Description: {{STAR_DESCRIPTION}}
Can-do goal: {{CAN_DO}}
Introduced lemmas: {{INTRODUCED_LEMMAS}}
Recycled lemmas: {{RECYCLED_LEMMAS}}
Prior lemmas from completed stars: {{PRIOR_LEMMAS}}
Learner CEFR: {{LEARNER_CEFR}}
Domain: {{DOMAIN}}

VOCABULARY BALANCE RULE:
- You MUST maintain a strict 60/40 ratio of old to new vocabulary in the generated lesson content.
- 60% of the prominent words used in phrases, examples, dialogues, and reading texts MUST come from "Prior lemmas from completed stars" and "Recycled lemmas".
- 40% of the vocabulary MUST be the new "Introduced lemmas".
- If "Prior lemmas" is empty (e.g., this is the first star), ignore this ratio and focus on "Introduced lemmas" suitable for the CEFR level.

TYPE REQUIREMENTS:
- PHRASE: metadata.phrases — at least 5 items with targetPhrase, translation (UK), dialogue (2–4 short English lines WITHOUT speaker labels like A:/B:), context (2–4 Ukrainian sentences). metadata.questions x5+ (varied types below).
- GRAMMAR: metadata.rule (~200+ Ukrainian chars), examples[{en,uk}] x5+, metadata.questions x5+ (varied types below).
- READING: metadata.text (60–100 English words), metadata.questions x4+.
- TEST: metadata.questions x5+ mixing prior topics.

QUESTION TYPES (metadata.questions[]):
- text_pick: { id, type:"text_pick", prompt?, options[3], correctAnswer }
- swipe_card: { id, type:"swipe_card", cards[{ id, word, hint, isMatch }] x3+ }
- sentence_builder: { id, type:"sentence_builder", prompt: "REQUIRED: Ukrainian translation of the target phrase", targetPhrase: "English phrase", wordChips: [scrambled words + 2 extra fake words] }
Never use video_riddle, blind_audio, or video segments. Never use metadata.quiz. Vary question types.

LANGUAGE: rules, prompts, context in UKRAINIAN. English in examples/options/phrases/text.`;