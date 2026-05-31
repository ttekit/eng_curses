import {
  BookOpen,
  CheckCircle,
  Flame,
  PlayCircle,
  Star,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { ProfileCard } from "./ProfileCard";
import type { ElementType } from "react";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";

export type ActivityLogType =
  | "video_completed"
  | "achievement"
  | "streak"
  | "video_started"
  | "vocabulary"
  | "level_up"
  | string;

export interface ActivityLogItem {
  id: string | number;
  type: ActivityLogType;
  title: string;
  description: string;
  timestamp: string;
}

const getActivityStyles = (type: string): { icon: ElementType; color: string; dotColor: string } => {
  switch (type) {
    case "video_completed":
      return { icon: CheckCircle, color: "text-accent", dotColor: "bg-accent" };
    case "achievement":
      return { icon: Trophy, color: "text-primary", dotColor: "bg-primary" };
    case "streak":
      return { icon: Flame, color: "text-orange-500", dotColor: "bg-orange-500" };
    case "video_started":
      return { icon: PlayCircle, color: "text-primary", dotColor: "bg-primary" };
    case "vocabulary":
      return { icon: BookOpen, color: "text-muted-foreground", dotColor: "bg-muted-foreground" };
    case "level_up":
      return { icon: TrendingUp, color: "text-primary", dotColor: "bg-primary" };
    default:
      return { icon: CheckCircle, color: "text-muted-foreground", dotColor: "bg-muted-foreground" };
  }
};

interface ProfileActivityProps {
  weeklyActivity?: { day: string; minutes: number }[];
  videosWatched?: number;
  testsCompleted?: number;
  averageScore?: number | null;
  activityLogs?: ActivityLogItem[];
}

export function ProfileActivity({
  weeklyActivity = [],
  videosWatched = 0,
  testsCompleted = 0,
  averageScore = null,
  activityLogs = [],
}: ProfileActivityProps) {
  const p = useAppMessages().profileActivity;
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

  const fallbackHistory: ActivityLogItem[] = [
    {
      id: "fallback-1",
      type: "video_completed",
      title: p.demoCompleteOffice,
      description: p.demoQuiz85,
      timestamp: p.demoAgoHours2,
    },
    {
      id: "fallback-2",
      type: "achievement",
      title: p.demoAchievement,
      description: p.demoQuizPerfectScore,
      timestamp: p.demoAgoHours5,
    },
  ];

  const activityMap = new Map(
    weeklyActivity.map((item) => [item.day.slice(0, 3), item.minutes > 0]),
  );

  const streakCalendar = daysOfWeek.map((day) => ({
    date: p.weekdayAbbrev[day],
    active: activityMap.get(day) || false,
  }));

  const activeDaysCount = streakCalendar.filter((d) => d.active).length;

  const displayLogs = activityLogs.length > 0 ? activityLogs : fallbackHistory;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ProfileCard title={p.historyTitle}>
          <div className="max-h-[500px] overflow-y-auto pr-2">
            <div className="relative">
              <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {displayLogs.map((activity) => {
                  const { icon: Icon, color, dotColor } = getActivityStyles(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="relative flex gap-4 pl-10"
                    >
                      <div className="absolute left-2 flex size-5 items-center justify-center rounded-full border-2 border-border bg-card">
                        <div className={`size-2 rounded-full ${dotColor}`} />
                      </div>
                      <div className="flex-1 rounded-xl bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-background/50 p-2">
                            <Icon className={`size-4 ${color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {activityLogs.length === 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              {p.historySampleFooter}
            </p>
          )}
        </ProfileCard>
      </div>

      <div className="space-y-6">
        <ProfileCard title={p.streakTitle}>
          <div className="flex justify-between gap-1">
            {streakCalendar.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className={`flex size-8 items-center justify-center rounded-lg ${day.active
                    ? "bg-orange-500 text-white shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
                    : "bg-secondary text-muted-foreground"
                    }`}
                >
                  {day.active ? <Flame className="size-4" /> : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {day.date}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {formatMessage(p.weekActiveSummary, {
              count: String(activeDaysCount),
              total: "7",
            })}
          </p>
        </ProfileCard>

        <ProfileCard title={p.thisWeekCardTitle}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="size-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {p.videosWatchedLabel}
                </span>
              </div>
              <span className="font-semibold text-foreground">{videosWatched}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {p.quizzesPassedLabel}
                </span>
              </div>
              <span className="font-semibold text-foreground">{testsCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {p.wordsLearnedLabel}
                </span>
              </div>
              <span className="font-semibold text-foreground">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-accent" />
                <span className="text-sm text-muted-foreground">
                  {p.averageScoreShort}
                </span>
              </div>
              <span className="font-semibold text-foreground">
                {averageScore !== null ? `${Math.round(averageScore)}%` : "—"}
              </span>
            </div>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}
