import { Link } from "react-router";
import { Clock, Play } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUser } from "../../context/UserContext";
import { AssignHomeworkButton } from "../AssignHomeworkButton";

export interface CatalogCardVideo {
  id: number;
  title: string;
  categoryLabel: string;
  durationLabel?: string;
  progress?: number;
  thumbnailUrl?: string;
  videoLink?: string;
  ageRestriction?: string;
}

const levelLike = /^(A1|A2|B1|B2|C1|C2)$/i;

const badgeClassForLabel = (label: string) => {
  const t = label.trim().toUpperCase();
  if (levelLike.test(t)) {
    const map: Record<string, string> = {
      A1: "bg-accent text-accent-foreground",
      A2: "bg-accent text-accent-foreground",
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
    "0+": "bg-accent text-foreground",
    "6+": "bg-(--light-blue) text-foreground",
    "12+": "bg-(--yellow) text-foreground",
    "16+": "bg-(--orange) text-foreground",
    "18+": "bg-destructive text-foreground",
    "21+": "bg-primary text-foreground",
  };
  return map[age] ?? "bg-muted text-muted-foreground";
};

interface CatalogVideoCardProps {
  video: CatalogCardVideo;
  showProgress?: boolean;
}

export function CatalogVideoCard({
  video,
  showProgress,
}: CatalogVideoCardProps) {
  const { user } = useUser();
  const isTeacher = user?.role === "TEACHER" || user?.role === "ADMIN";

  return (
    <div className="group relative flex w-64 shrink-0 flex-col gap-3 sm:w-80">
      <Link to={`/content/${video.id}`} className="flex flex-col gap-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground text-sm">No cover</span>
            </div>
          )}

          <div className="absolute inset-0 bg-background/10 transition-colors group-hover:bg-transparent" />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/40 backdrop-blur-sm">
              <Play className="h-6 w-6 fill-foreground text-foreground" />
            </div>
          </div>

          {video.ageRestriction ? (
            <span
              className={cn(
                "absolute bottom-2 left-2 rounded px-1.5 py-0.5 text-xs font- z-10",
                ageRestrictionClass(video.ageRestriction),
              )}
            >
              {video.ageRestriction}
            </span>
          ) : null}

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

        <h3 className="line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary">
          {video.title}
        </h3>
      </Link>

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
