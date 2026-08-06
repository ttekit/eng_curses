/**
 * Default prompt for inferring video tags and complexity from a transcript.
 */

export const DEFAULT_PROMPT_TRANSCRIPT_TAGS = `You describe English learning video content from its transcript only.
Return ONLY valid JSON with this exact shape (no extra keys).
CRITICAL: DO NOT use markdown formatting. DO NOT wrap the output in \`\`\`json\`\`\`. Return ONLY raw JSON text.
{"systemTags":["B1"],"userTags":["Action","Comedy"],"complexity":5}
Rules:
- systemTags: 1 to 3 items. Each value MUST be copied exactly from this list (spelling, case): {{SYSTEM_LIST}}. Choose the CEFR level that best matches the language difficulty of what is SPOKEN (vocabulary, grammar, speed).
CRITICAL CEFR CALIBRATION:
* A1/A2: Basic vocabulary, short simple sentences, high repetition, children's cartoons, literal meanings.
* B1/B2: Everyday conversations, moderate vocabulary, intermediate grammar. Do NOT assign B1 to simple children's content.
* C1/C2: Advanced vocabulary, complex abstract ideas, idioms, dense or technical dialogue.
{{USER_TAG_RULES}}
- complexity: integer 1 to 10 evaluating the overall cognitive load and language density of the text.
* 1-3: Very easy (basic words, clear context, suitable for A1/A2).
* 4-7: Moderate (standard conversational English, suitable for B1/B2).
* 8-10: Very demanding (dense text, heavy slang, academic, suitable for C1/C2).
Video title: {{VIDEO_TITLE}}
Transcript:
{{TRANSCRIPT}}`;