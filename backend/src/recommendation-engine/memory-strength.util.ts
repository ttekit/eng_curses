export const INITIAL_MEMORY_STRENGTH = 2.0;
export const KNOWN_THRESHOLD = 20;
export const SKIP_WATCH_THRESHOLD_SEC = 1.5;

export function apply_complete_review(
  oldStrength: number,
  deltaT_days: number,
): number {
  const safeStrength = Math.max(oldStrength, 0.01);
  const multiplier = 1 + 0.5 * Math.pow(Math.exp(-deltaT_days / safeStrength), -0.2);
  return oldStrength * multiplier;
}

export function apply_click_penalty(oldStrength: number): number {
  return Math.max(1.0, oldStrength * 0.5);
}

export function should_promote_to_known(newStrength: number): boolean {
  return newStrength > KNOWN_THRESHOLD;
}

export function is_watch_complete(
  watchTimeSec: number,
  loopLengthSec: number,
): boolean {
  return watchTimeSec >= loopLengthSec;
}

export function is_watch_skip(watchTimeSec: number): boolean {
  return watchTimeSec < SKIP_WATCH_THRESHOLD_SEC;
}
