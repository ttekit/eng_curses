/**
 * Default prompt for inferring video tags and complexity from a transcript.
 */

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
