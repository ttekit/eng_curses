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

TYPE REQUIREMENTS:
- PHRASE: metadata.phrases — at least 5 items with targetPhrase, translation (UK), dialogue (2–4 short English lines WITHOUT speaker labels like A:/B:), context (2–4 Ukrainian sentences). metadata.questions x5+ (varied types below).
- GRAMMAR: metadata.rule (~200+ Ukrainian chars), examples[{en,uk}] x5+, metadata.questions x5+ (varied types below).
- READING: metadata.text (60–100 English words), metadata.questions x4+.
- TEST: metadata.questions x5+ mixing prior topics.

QUESTION TYPES (metadata.questions[]):
- text_pick: { id, type:"text_pick", prompt?, options[3], correctAnswer }
- swipe_card: { id, type:"swipe_card", cards[{ id, word, hint, isMatch }] x3+ }
- sentence_builder: { id, type:"sentence_builder", targetPhrase, wordChips[] }
- reward_checkpoint: { id, type:"reward_checkpoint", message } — optional, max 1 per star
Never use video_riddle, blind_audio, or video segments. Never use metadata.quiz. Vary question types.

LANGUAGE: rules, prompts, context in UKRAINIAN. English in examples/options/phrases/text.`;
