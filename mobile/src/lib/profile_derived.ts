import type { AchievementItem } from "../components/profile/AchievementGrid";
import type { SkillScore } from "../components/profile/SkillBars";

type LearningStats = {
  videosCompleted: number;
  testsCompleted: number;
  averageScore: number | null;
};

export function build_skill_scores(averageScore: number | null): SkillScore[] {
  const base = averageScore ?? 48;
  return [
    { name: "Listening", value: clamp_percent(base + 12) },
    { name: "Vocabulary", value: clamp_percent(base + 4) },
    { name: "Grammar", value: clamp_percent(base - 6) },
    { name: "Speaking", value: clamp_percent(base - 14) },
  ];
}

export function build_achievement_items(
  achievementIds: readonly string[],
  stats: LearningStats | null,
  streak: number,
): AchievementItem[] {
  const unlocked = new Set(achievementIds.map((id) => id.toLowerCase()));
  const hasStreak = streak >= 7 || unlocked.has("week_streak");
  const hasTest = (stats?.testsCompleted ?? 0) > 0 || unlocked.has("first_test");
  const hasVideos = (stats?.videosCompleted ?? 0) >= 30 || unlocked.has("30_videos");
  const hasPerfect = unlocked.has("perfect_quiz");
  const hasLevelUp = unlocked.has("level_up");
  const hasWords = unlocked.has("50_words");

  return [
    { label: "Week Streak", icon: "zap", unlocked: hasStreak },
    { label: "First Test", icon: "award", unlocked: hasTest },
    { label: "50 Words", icon: "book-open", unlocked: hasWords },
    { label: "Perfect Quiz", icon: "target", unlocked: hasPerfect },
    { label: "Level Up", icon: "trending-up", unlocked: hasLevelUp },
    { label: "30 Videos", icon: "film", unlocked: hasVideos },
  ];
}

export function format_hours(totalWatchTimeMin: number): string {
  const hours = Math.round(totalWatchTimeMin / 60);
  return String(Math.max(hours, 0));
}

function clamp_percent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
