export const MIN_STABILITY_DAYS = 0.25;
export const MAX_STABILITY_DAYS = 180;
export const INITIAL_STABILITY_DAYS = 1.0;
const MS_PER_DAY = 86_400_000;

export type ReviewInput = {
  stability: number;
  isCorrect: boolean;
  timeSinceLastReviewSec: number;
};

export type ReviewResult = {
  stability: number;
  retrievability: number;
  nextReviewAt: Date;
};

export function compute_retrievability(
  stabilityDays: number,
  elapsedDays: number,
): number {
  const safeStability = Math.max(stabilityDays, MIN_STABILITY_DAYS);
  const safeElapsed = Math.max(elapsedDays, 0);
  return Math.pow(2, -safeElapsed / safeStability);
}

export function apply_review(input: ReviewInput): ReviewResult {
  const elapsedDays = Math.max(input.timeSinceLastReviewSec / 86400, 0.01);
  const retrievability = compute_retrievability(input.stability, elapsedDays);
  const newStability = input.isCorrect
    ? Math.min(
        MAX_STABILITY_DAYS,
        input.stability * (1 + 0.5 * (1 - retrievability)),
      )
    : Math.max(MIN_STABILITY_DAYS, input.stability * 0.4);
  const intervalDays = input.isCorrect
    ? newStability
    : MIN_STABILITY_DAYS;
  const nextReviewAt = new Date(Date.now() + intervalDays * MS_PER_DAY);
  return { stability: newStability, retrievability, nextReviewAt };
}
