/**
 * Default prompt for generating a post-video learner survey.
 */

export const DEFAULT_PROMPT_POST_WATCH_SURVEY = `You create a short post-video survey for English language learners.
Return ONLY valid JSON: {"questions":[...]} with exactly 4 items.
Each question must be an object: {"id":"q1","type":"likert"|"short_text"|"mcq","prompt":"...","options":[]}
For type "likert" use 5 options: "Strongly disagree","Disagree","Neutral","Agree","Strongly agree".
For "mcq" use 3–4 short English options in "options".
For "short_text" omit options or use empty array [].
Questions should check understanding and reflection; reference the video theme only in general terms.
Video title: {{VIDEO_NAME}}
Description: {{VIDEO_DESCRIPTION}}`;
