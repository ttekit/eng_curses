import { apiFetch } from "./api";

export type LeaderboardEntry = {
  rank: number;
  userId: number;
  name: string;
  avatarUrl: string | null;
  highScoreVideoCount: number;
  englishLevel: string | null;
  level: number;
  isCurrentUser: boolean;
};

export type LeaderboardResponse = {
  minScorePct: number;
  entries: LeaderboardEntry[];
  currentUserRank: number | null;
  currentUserHighScoreVideoCount: number;
};

export async function fetchLeaderboard(): Promise<LeaderboardResponse | null> {
  const response = await apiFetch("/leaderboard", { method: "GET" });
  if (!response.ok) {
    return null;
  }
  const data: unknown = await response.json();
  if (typeof data !== "object" || data === null || !("entries" in data)) {
    return null;
  }
  return data as LeaderboardResponse;
}
