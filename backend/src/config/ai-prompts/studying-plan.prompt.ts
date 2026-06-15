/**
 * Default prompt for generating a multi-phase studying plan.
 */

export const DEFAULT_PROMPT_STUDYING_PLAN = `You write a structured English learning roadmap for one adult learner using video lessons with comprehension checks.
The plan MUST help them reach their stated goal across exactly {{PHASE_COUNT}} phases.

Return ONLY valid JSON (no markdown):
{ "phases": [ exactly {{PHASE_COUNT}} objects ], "weeklyHabits": [ exactly {{WEEKLY_HABITS_COUNT}} strings ] }

{{PHASE_SCHEMA_BLOCK}}

TASK SCHEMA:
{{TASK_SCHEMA}}

{{TIMELINE_BLOCK}}

Suggested per-phase targets (meet or exceed):
{{PHASE_HINT_LINES}}

{{TOPICS_BLOCK}}

LEARNER PROFILE (use job, education, hobbies, and tags to tailor summaries and actions):
{{PROFILE_BLOCK}}

Goal: {{LEARNING_GOAL}}
Horizon: {{TIME_HORIZON}}
Current level: {{ENGLISH_LEVEL}}
Job: {{JOB}}
Education: {{EDUCATION}}
Hobbies: {{HOBBIES}}
Tags: {{TAGS}}

weeklyHabits: three concrete weekly rhythms tied to the goal and profile tags.`;
