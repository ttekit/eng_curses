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
 * Shuffles avatar URLs from the local `avatars` table for demo users.
 */
export function build_shuffled_avatar_pool(
  activeAvatarUrls: readonly string[],
  userCount: number,
): string[] {
  const shuffled = shuffle_array(activeAvatarUrls);
  return Array.from({ length: userCount }, (_, index) => {
    return shuffled[index % shuffled.length] ?? shuffled[0]!;
  });
}

/**
 * Requires at least one active avatar URL (from `npm run copy:avatars-prod`).
 */
export function require_shuffled_leaderboard_avatars(
  activeAvatarUrls: readonly string[],
  userCount: number,
): string[] {
  if (activeAvatarUrls.length === 0) {
    throw new Error(
      "No active avatars in local DB. Run: npm run copy:avatars-prod",
    );
  }
  return build_shuffled_avatar_pool(activeAvatarUrls, userCount);
}
