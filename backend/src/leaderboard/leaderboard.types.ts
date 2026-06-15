export type LeaderboardEntryDto = {
  rank: number;
  userId: number;
  name: string;
  avatarUrl: string | null;
  highScoreVideoCount: number;
  englishLevel: string | null;
  level: number;
  isCurrentUser: boolean;
};

export type LeaderboardResponseDto = {
  minScorePct: number;
  entries: LeaderboardEntryDto[];
  currentUserRank: number | null;
  currentUserHighScoreVideoCount: number;
};
