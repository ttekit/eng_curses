import {
  Award,
  BookOpen,
  Crown,
  Flame,
  Lock,
  Star,
  X,
  Play,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { ProfileCard } from "./ProfileCard";
import { useUser } from "../../context/UserContext";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";

function PlayCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  );
}

const rarityColors = {
  common: "border-muted-foreground/30 bg-secondary/50",
  rare: "border-primary/50 bg-primary/10",
  legendary: "border-accent/50 bg-accent/10",
} as const;

const rarityBadge = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-primary/20 text-primary",
  legendary: "bg-accent/20 text-accent",
} as const;

export function ProfileAchievements() {
  const { user } = useUser();
  const p = useAppMessages().profileAchievements;

  // Добавляем стейт для выбранного видео
  const [selectedFirstVideo, setSelectedFirstVideo] = useState<any>(null);

  const firstWatchedVideo = (user as any).firstWatchedVideo;

  const baseAchievements = [
    {
      id: "first-video",
      title: p.firstVideoTitle,
      description: p.firstVideoDesc,
      icon: PlayCircleIcon,
      rarity: "common" as const,
      requirement: 1,
      type: "video" as const,
    },
    {
      id: "streak-7",
      title: p.streak7Title,
      description: p.streak7Desc,
      icon: Flame,
      rarity: "common" as const,
      requirement: 7,
      type: "streak" as const,
    },
    {
      id: "streak-30",
      title: p.streak30Title,
      description: p.streak30Desc,
      icon: Crown,
      rarity: "rare" as const,
      requirement: 30,
      type: "streak" as const,
    },
    {
      id: "vocabulary-100",
      title: p.vocab100Title,
      description: p.vocab100Desc,
      icon: BookOpen,
      rarity: "common" as const,
      requirement: 100,
      type: "vocab" as const,
    },
    {
      id: "vocabulary-500",
      title: p.vocab500Title,
      description: p.vocab500Desc,
      icon: Star,
      rarity: "rare" as const,
      requirement: 500,
      type: "vocab" as const,
    },
    {
      id: "vocabulary-1000",
      title: p.vocab1000Title,
      description: p.vocab1000Desc,
      icon: Award,
      rarity: "legendary" as const,
      requirement: 1000,
      type: "vocab" as const,
    },
  ];

  const rarityLabels = {
    common: p.rarityCommon,
    rare: p.rarityRare,
    legendary: p.rarityLegendary,
  };

  const userAchievements = new Set(
    (user?.achievements || [])
      .map((a: { achievementId?: string } | string) =>
        typeof a === "string" ? a : a?.achievementId,
      )
      .filter(Boolean),
  );

  const currentStreak =
    (user as { currentStreak?: number })?.currentStreak || 0;

  const unlockedCount = baseAchievements.filter((a) => {
    const fromDb = userAchievements.has(a.id);
    let progress = 0;
    if (a.type === "streak") progress = currentStreak;
    return fromDb || progress >= a.requirement;
  }).length;

  const totalCount = baseAchievements.length;

  return (
    <div className="space-y-6">
      <ProfileCard noPadding contentClassName="p-0">
        <div className="border-b rounded-2xl border-border/40 bg-gradient-to-br from-primary/20 via-card to-accent/20 p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <img src="/ResultGood.svg" className="w-28 h-28" alt="" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                {p.hunterTitle}
              </h2>
              <p className="mb-4 text-muted-foreground">
                {formatMessage(p.unlockedLead, {
                  unlocked: String(unlockedCount),
                  total: String(totalCount),
                })}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {p.progressLabel}
                  </span>
                  <span className="font-medium text-foreground">
                    {Math.round((unlockedCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProfileCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {baseAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const rarity = achievement.rarity;

          let currentProgressValue = 0;
          if (achievement.type === "streak")
            currentProgressValue = currentStreak;

          const isUnlocked =
            userAchievements.has(achievement.id) ||
            currentProgressValue >= achievement.requirement;

          const displayProgress = Math.min(
            currentProgressValue,
            achievement.requirement,
          );
          const progressPercent = Math.round(
            (displayProgress / achievement.requirement) * 100,
          );

          // Проверяем, можно ли кликнуть по этой карточке (если это ачивка первого видео, она разблокирована и есть данные)
          const isFirstVideoAchievement = achievement.id === "first-video";
          const isClickable =
            isUnlocked && isFirstVideoAchievement && firstWatchedVideo;

          return (
            <div
              key={achievement.id}
              onClick={() =>
                isClickable && setSelectedFirstVideo(firstWatchedVideo)
              }
              className={`relative overflow-hidden rounded-xl border transition-all ${
                isUnlocked
                  ? rarityColors[rarity]
                  : "border-border/30 bg-card/30 opacity-70"
              } ${isClickable ? "cursor-pointer hover:border-primary/50 hover:shadow-md group" : ""}`}
            >
              {isClickable && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Play className="size-3" /> View
                  </span>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-xl p-2.5 ${
                      isUnlocked
                        ? rarity === "legendary"
                          ? "bg-accent/20"
                          : rarity === "rare"
                            ? "bg-primary/20"
                            : "bg-secondary"
                        : "bg-secondary/50"
                    }`}
                  >
                    {isUnlocked ? (
                      <Icon
                        className={`size-6 ${rarity === "legendary" ? "text-accent" : rarity === "rare" ? "text-primary" : "text-foreground"}`}
                      />
                    ) : (
                      <Lock className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground">
                        {achievement.title}
                      </h3>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs capitalize ${rarityBadge[rarity]}`}
                      >
                        {rarityLabels[rarity]}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {achievement.description}
                    </p>

                    {isUnlocked ? (
                      <p className="text-xs text-accent">{p.unlockedExclaim}</p>
                    ) : (
                      <div className="space-y-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {displayProgress} / {achievement.requirement}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно первого видео */}
      {selectedFirstVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedFirstVideo(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Flame className="size-5 text-orange-500" />
                Where It All Began
              </h3>
              <button
                onClick={() => setSelectedFirstVideo(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              This was the very first video you watched on Explys. Look how far
              you've come since then!
            </p>

            <div className="group relative overflow-hidden rounded-xl bg-muted aspect-video mb-6 border border-border/50 shadow-inner">
              {selectedFirstVideo.thumbnailUrl ? (
                <img
                  src={selectedFirstVideo.thumbnailUrl}
                  alt={selectedFirstVideo.videoName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <PlayCircleIcon className="size-12 text-muted-foreground opacity-50" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="rounded-full bg-primary/90 p-4 text-white shadow-lg backdrop-blur-md">
                  <Play className="size-6 fill-current ml-1" />
                </div>
              </div>
            </div>

            <h4 className="font-bold text-foreground text-center mb-6 line-clamp-2">
              {selectedFirstVideo.videoName}
            </h4>

            <Link
              to={selectedFirstVideo.url}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 cursor-pointer hover:shadow-primary/20 hover:shadow-lg"
            >
              Watch it again
              <Play className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
