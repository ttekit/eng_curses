/**
 * Default task schema block embedded in the studying plan prompt.
 */

export const DEFAULT_PROMPT_STUDYING_PLAN_TASK_SCHEMA = `Each phase MUST include a non-empty **tasks** array. Each task object MUST have **id** (short slug string) and **kind** one of:
  distinct_videos_passed: { id, kind, minCount (int >= 1), minScorePct (number 0–100), scope: "phase" | "cumulative" }
  streak_days: { id, kind, minConsecutive (int >= 1) }
  vocabulary_terms_added: { id, kind, minCount (int >= 1), scope: "phase" }
  watch_time_minutes: { id, kind, minMinutes (int >= 1), scope: "phase" }
  min_phase_calendar_days: { id, kind, minDays (int >= 1) }
  phase_final_test_passed: { id, kind, minScorePct (number 0–100) } — required for phases 1–3 (not the last phase)
Every phase should include at least one **distinct_videos_passed**, **streak_days**, **vocabulary_terms_added**, **watch_time_minutes**, and **min_phase_calendar_days** task matching the numeric hints for that phase. Non-final phases MUST also include **phase_final_test_passed** with minScorePct 70.`;
