const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const DEMO_MIN_VIDEOS = 20;
const DEMO_MAX_VIDEOS_CAP = 72;

function shuffle_array<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    const swapValue = copy[swapIndex];
    if (current !== undefined && swapValue !== undefined) {
      copy[index] = swapValue;
      copy[swapIndex] = current;
    }
  }
  return copy;
}

/**
 * Random qualifying video counts (min 20), sorted high → low with natural gaps.
 */
export function build_realistic_video_counts(
  userCount: number,
  availableVideos: number,
): number[] {
  const ceiling = Math.min(availableVideos, DEMO_MAX_VIDEOS_CAP);
  const floor = Math.min(DEMO_MIN_VIDEOS, ceiling);
  const counts: number[] = [];
  let cursor = ceiling;

  for (let index = 0; index < userCount; index += 1) {
    counts.push(cursor);
    const remainingUsers = userCount - index - 1;
    const remainingSpan = Math.max(0, cursor - floor);
    const maxStep =
      remainingUsers > 0
        ? Math.min(4, Math.max(1, Math.ceil(remainingSpan / remainingUsers)))
        : 0;
    const step =
      maxStep <= 0 ? 0 : Math.floor(Math.random() * maxStep) + 1;
    cursor = Math.max(floor, cursor - step);
  }

  return counts;
}

export function pick_random_video_ids(
  videoIds: readonly number[],
  count: number,
): number[] {
  const shuffled = shuffle_array(videoIds);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function resolve_random_cefr_level(): string {
  const index = Math.floor(Math.random() * CEFR_LEVELS.length);
  return CEFR_LEVELS[index] ?? "B1";
}

export function resolve_random_quiz_score(): number {
  return 80 + Math.floor(Math.random() * 20);
}
