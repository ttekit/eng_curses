import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2, Video, GraduationCap, Play, Clock, Lock } from "lucide-react";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { useAppMessages } from "../../hooks/useAppMessages";
import { cn } from "../../lib/utils";

export type StudentVideoItem = {
  contentId: number;
  name: string;
  friendlyLink: string;
  contentVideoId: number | null;
  videoLink: string | null;
  thumbnailUrl: string | null;
  availableFrom?: string | null;
  deadline?: string | null;
};

export function StudentTeacherVideos() {
  const t = useAppMessages().studentTeacherVideos;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<StudentVideoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/contents/student/teacher-videos", {
          method: "GET",
        });
        if (!res.ok) {
          setError(await getResponseErrorMessage(res));
          setVideos([]);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setVideos(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError(t.loadError);
          setVideos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t.loadError]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>{t.loadingLessons}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
        <GraduationCap className="size-12 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold">{t.emptyTitle}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{t.emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Video className="size-6 text-primary" />
          {t.lessonsFromTeacher}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.lessonsDescription}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => {
          const now = new Date();
          const openDate = video.availableFrom
            ? new Date(video.availableFrom)
            : null;
          const closeDate = video.deadline ? new Date(video.deadline) : null;

          const isLocked = openDate && openDate > now;
          const isClosed = closeDate && closeDate < now;
          const isPlayable = video.contentVideoId && !isLocked && !isClosed;

          return (
            <div
              key={video.contentId}
              className={cn(
                "rounded-xl border bg-card/50 overflow-hidden flex flex-col justify-between transition-all",
                isLocked || isClosed
                  ? "border-border/40 opacity-75 grayscale-[30%]"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover",
                      (isLocked || isClosed) && "opacity-60",
                    )}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent/10" />
                )}

                {isPlayable ? (
                  <Link
                    to={`/content/${video.contentVideoId}`}
                    className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg hover:scale-105 transition-transform"
                  >
                    <Play className="ml-1 h-5 w-5 text-primary-foreground fill-primary-foreground" />
                  </Link>
                ) : (
                  (isLocked || isClosed) && (
                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-lg">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )
                )}
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className={cn(
                      "font-semibold line-clamp-2",
                      isLocked || isClosed
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {video.name}
                  </h3>

                  {(openDate || closeDate) && (
                    <div className="mt-2.5 flex flex-col gap-1">
                      {openDate && isLocked && (
                        <div className="text-xs font-semibold flex items-center gap-1.5 text-blue-500">
                          <Clock className="size-3.5" />
                          Opens:{" "}
                          {openDate.toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      )}

                      {closeDate && (
                        <div
                          className={cn(
                            "text-xs font-semibold flex items-center gap-1.5",
                            isClosed ? "text-destructive" : "text-amber-500",
                          )}
                        >
                          <Clock className="size-3.5" />
                          {isClosed ? "Closed:" : "Closes:"}{" "}
                          {closeDate.toLocaleString([], {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isPlayable ? (
                  <Link
                    to={`/content/${video.contentVideoId}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors text-primary"
                  >
                    {t.openLessonQuiz}
                  </Link>
                ) : isLocked ? (
                  <div className="inline-flex w-full items-center justify-center rounded-lg bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed">
                    {t.lessonLocked}
                  </div>
                ) : isClosed ? (
                  <div className="inline-flex w-full items-center justify-center rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive cursor-not-allowed">
                    {t.deadlinePassed}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t.processingVideo}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
