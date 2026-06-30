import { Link } from "react-router";
import { Calendar, Clock, Lock, Play } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUser } from "../../context/UserContext";
import { AssignHomeworkButton } from "../AssignHomeworkButton";
import { useMemo } from "react";
import { resolveVideoAgeAccess } from "../../lib/ageEligibility";

export interface CatalogCardVideo {
  id: number;
  title: string;
  categoryLabel: string;
  durationLabel?: string;
  progress?: number;
  thumbnailUrl?: string;
  videoLink?: string;
  ageRestriction?: string;
  friendlyLink?: string;
  level?: string;
}

const levelLike = /^(A1|A2|B1|B2|C1|C2)$/i;

const badgeClassForLabel = (label: string) => {
  const t = label.trim().toUpperCase();
  if (levelLike.test(t)) {
    const map: Record<string, string> = {
      A1: "bg-accent text-primary-foreground",
      A2: "bg-accent text-primary-foreground",
      B1: "bg-primary/80 text-primary-foreground",
      B2: "bg-primary text-primary-foreground",
      C1: "bg-destructive/80 text-destructive-foreground",
      C2: "bg-destructive text-destructive-foreground",
    };
    return map[t] ?? "bg-muted text-muted-foreground";
  }
  return "bg-accent/20 text-accent";
};

const ageRestrictionClass = (age: string) => {
  const map: Record<string, string> = {
    "0+": "bg-accent text-primary-foreground",
    "6+": "bg-(--light-blue) text-primary-foreground",
    "12+": "bg-(--yellow) text-primary-foreground",
    "16+": "bg-(--orange) text-primary-foreground",
    "18+": "bg-destructive text-primary-foreground",
    "21+": "bg-primary text-primary-foreground",
  };
  return map[age] ?? "bg-muted text-muted-foreground";
};

interface CatalogVideoCardProps {
  video: CatalogCardVideo;
  showProgress?: boolean;
  onRequestAgeVerification?: (ageRestriction: string) => void;
}

export function CatalogVideoCard({
  video,
  showProgress,
  onRequestAgeVerification,
}: CatalogVideoCardProps) {
  const { user } = useUser();
  const isTeacher =
    user?.role?.toLowerCase() === "teacher" ||
    user?.role?.toLowerCase() === "admin";

  const ageAccess = useMemo(
    () => resolveVideoAgeAccess(user, video.ageRestriction),
    [user, video.ageRestriction],
  );
  const isLocked = ageAccess !== "allowed";
  const needsDob = ageAccess === "needs_dob";
  const targetUrl = `/content/${video.friendlyLink || video.id}`;

  const cardContent = (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        <div
          className={cn(
            "h-full w-full transition-all duration-300",
            isLocked && "blur-md brightness-50",
          )}
        >
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500",
                !isLocked && "group-hover:scale-105",
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground text-sm">No cover</span>
            </div>
          )}

          {!isLocked && (
            <div className="absolute inset-0 bg-background/10 transition-colors group-hover:bg-transparent" />
          )}

          {(video.ageRestriction || video.level) && (
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
              {video.ageRestriction && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-bold",
                    ageRestrictionClass(video.ageRestriction),
                  )}
                >
                  {video.ageRestriction}
                </span>
              )}
              {video.level && (
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-semibold backdrop-blur-md shadow-sm",
                    badgeClassForLabel(video.level),
                  )}
                >
                  {video.level}
                </span>
              )}
            </div>
          )}

          {video.durationLabel ? (
            <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm z-10">
              <Clock className="h-3 w-3" />
              {video.durationLabel}
            </span>
          ) : null}

          {showProgress && video.progress !== undefined ? (
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-muted z-10">
              <div
                className="h-full bg-primary"
                style={{ width: `${video.progress}%` }}
              />
            </div>
          ) : null}
        </div>

        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 z-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/40 backdrop-blur-sm">
              <Play className="h-6 w-6 fill-foreground text-foreground" />
            </div>
          </div>
        )}

        {isLocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            {needsDob ? (
              <Calendar className="w-10 h-10 text-white/70 drop-shadow-md" />
            ) : (
              <Lock
                className="w-10 h-10 text-white/50 drop-shadow-md"
                strokeWidth={1.5}
              />
            )}
          </div>
        )}
      </div>

      <h3
        className={cn(
          "line-clamp-2 font-medium text-foreground transition-colors",
          !isLocked && "group-hover:text-primary",
          isLocked && "opacity-50",
        )}
      >
        {video.title}
      </h3>
    </>
  );

  return (
    <div className="group relative flex w-64 shrink-0 flex-col gap-3 sm:w-80">
      {isLocked ? (
        needsDob ? (
          onRequestAgeVerification ? (
            <button
              type="button"
              onClick={() =>
                onRequestAgeVerification(video.ageRestriction || "18+")
              }
              className="flex flex-col gap-3 text-left cursor-pointer"
            >
              {cardContent}
            </button>
          ) : (
            <Link to={targetUrl} className="flex flex-col gap-3">
              {cardContent}
            </Link>
          )
        ) : (
          <div className={cn("flex flex-col gap-3", "cursor-not-allowed")}>
            {cardContent}
          </div>
        )
      ) : (
        <Link to={targetUrl} className="flex flex-col gap-3">
          {cardContent}
        </Link>
      )}

      {isTeacher && (
        <div className="mt-auto">
          <AssignHomeworkButton
            contentId={video.id}
            contentName={video.title}
          />
        </div>
      )}
    </div>
  );
}
