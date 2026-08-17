import { Link } from "react-router";
import { Clock, Lock, Play } from "lucide-react";
import { cn } from "../../lib/utils";
import { useUser } from "../../context/UserContext";
import { AssignHomeworkButton } from "../AssignHomeworkButton";
import { useMemo } from "react";
import { resolveVideoAgeAccess } from "../../lib/ageEligibility";
import { useAppMessages } from "../../hooks/useAppMessages";

function IconRatingNC17({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 46 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1" y="1" width="44" height="22" rx="3" />
      <text
        x="23"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="900"
        stroke="none"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        NC-17
      </text>
    </svg>
  );
}
export function IconRatingR({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 28 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="1" y="1" width="26" height="22" rx="3" />
      <text
        x="14"
        y="15.5"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="currentColor"
        fontFamily="'Times New Roman', Georgia, serif"
      >
        R
      </text>
    </svg>
  );
}
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
  className?: string;
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
  className?: string;
}
export function CatalogVideoCard({
  video,
  showProgress,
  onRequestAgeVerification,
  className,
}: CatalogVideoCardProps) {
  const { user } = useUser();
  const isTeacher =
    user?.role?.toLowerCase() === "teacher" ||
    user?.role?.toLowerCase() === "admin";

  const common = useAppMessages().common;

  const ageAccess = useMemo(() => {
    if (
      !video.ageRestriction ||
      ["0+", "6+", "12+"].includes(video.ageRestriction)
    ) {
      return "allowed";
    }
    return resolveVideoAgeAccess(user, video.ageRestriction);
  }, [user, video.ageRestriction]);

  const isLocked = ageAccess !== "allowed";
  const needsDob = ageAccess === "needs_dob";
  const targetUrl = `/content/${video.friendlyLink || video.id}`;

  const cardContent = (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted z-0">
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
              <span className="text-muted-foreground text-sm">
                {common.noCover}
              </span>
            </div>
          )}

          {!isLocked && (
            <div className="absolute inset-0 bg-background/10 transition-colors group-hover:bg-transparent" />
          )}
        </div>

        {(video.ageRestriction || video.level) && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-40">
            {video.ageRestriction && (
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-xs font-bold shadow-sm",
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
          <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm z-40">
            <Clock className="h-3 w-3" />
            {video.durationLabel}
          </span>
        ) : null}

        {showProgress && video.progress !== undefined ? (
          <div className="absolute right-0 bottom-0 left-0 h-1 bg-muted z-40">
            <div
              className="h-full bg-primary"
              style={{ width: `${video.progress}%` }}
            />
          </div>
        ) : null}

        {/* ОБНОВЛЕННАЯ КНОПКА PLAY: Крупнее и с плавной анимацией */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/50 backdrop-blur-md shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="h-8 w-8 ml-1 fill-foreground text-foreground" />
            </div>
          </div>
        )}
        
        {isLocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            {video.ageRestriction === "16+" ? (
              <IconRatingR className="h-10 text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            ) : video.ageRestriction === "18+" ? (
              <IconRatingNC17 className="h-10 text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
            ) : (
              <Lock
                className="w-12 h-12 text-white/50 drop-shadow-md"
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
    <div
      className={cn(
        "group relative flex flex-col gap-3",
        className ||
          "w-[280px] shrink-0 sm:w-[320px] md:w-[360px] lg:w-[400px] xl:w-[340px] 2xl:w-[425px]",
      )}
    >
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
