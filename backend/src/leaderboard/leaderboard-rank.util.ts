import type { LeaderboardEntryDto } from "./leaderboard.types";

export type LeaderboardUserRow = {
  userId: number;
  name: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  englishLevel: string | null;
  highScoreVideoCount: number;
};

/**
 * Maps sorted leaderboard rows to ranked entries for the API response.
 */
export function build_leaderboard_entries(
  rows: readonly LeaderboardUserRow[],
  currentUserId: number,
): LeaderboardEntryDto[] {
  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: row.name,
    avatarUrl: row.avatarUrl,
    highScoreVideoCount: row.highScoreVideoCount,
    englishLevel: row.englishLevel?.trim() || null,
    level: row.level > 0 ? row.level : Math.floor(row.xp / 1000) + 1,
    isCurrentUser: row.userId === currentUserId,
  }));
}

/**
 * Rank = 1 + number of learners with a strictly higher qualifying video count.
 */
export function resolve_leaderboard_rank(
  highScoreVideoCount: number,
  usersAhead: number,
): number | null {
  if (highScoreVideoCount <= 0) {
    return null;
  }
  return usersAhead + 1;
}
