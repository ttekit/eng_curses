import {
  build_leaderboard_entries,
  resolve_leaderboard_rank,
} from "./leaderboard-rank.util";

describe("leaderboard-rank.util", () => {
  it("assigns ranks and marks the current user", () => {
    const entries = build_leaderboard_entries(
      [
        {
          userId: 1,
          name: "Alice",
          avatarUrl: null,
          xp: 2500,
          level: 3,
          englishLevel: "B2",
          highScoreVideoCount: 12,
        },
        {
          userId: 2,
          name: "Bob",
          avatarUrl: "/a.png",
          xp: 500,
          level: 1,
          englishLevel: "A2",
          highScoreVideoCount: 8,
        },
      ],
      2,
    );
    expect(entries[0]?.rank).toBe(1);
    expect(entries[1]?.rank).toBe(2);
    expect(entries[1]?.isCurrentUser).toBe(true);
    expect(entries[0]?.englishLevel).toBe("B2");
  });

  it("derives level from xp when level is zero", () => {
    const entries = build_leaderboard_entries(
      [
        {
          userId: 1,
          name: "Alice",
          avatarUrl: null,
          xp: 1500,
          level: 0,
          englishLevel: "C1",
          highScoreVideoCount: 3,
        },
      ],
      1,
    );
    expect(entries[0]?.level).toBe(2);
  });

  it("returns null rank when the user has no qualifying videos", () => {
    expect(resolve_leaderboard_rank(0, 4)).toBeNull();
  });

  it("returns rank as users ahead plus one", () => {
    expect(resolve_leaderboard_rank(5, 3)).toBe(4);
  });
});
