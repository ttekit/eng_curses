import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2, Video, GraduationCap, Play } from "lucide-react";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { useAppMessages } from "../../hooks/useAppMessages";

export type StudentVideoItem = {
  contentId: number;
  name: string;
  friendlyLink: string;
  contentVideoId: number | null;
  videoLink: string | null;
  thumbnailUrl: string | null;
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
        <p>Loading lessons from your teacher…</p>
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
        <p className="max-w-md text-sm text-muted-foreground">
          {t.emptyBody}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Video className="size-6 text-primary" />
          Lessons from your Teacher
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exclusive video materials uploaded by your instructor. Watch them and
          complete the generated quizzes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <div
            key={video.contentId}
            className="rounded-xl border border-border bg-card/50 overflow-hidden transition-all hover:border-primary/40 flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-accent/10" />
              )}

              {video.contentVideoId && (
                <Link
                  to={`/content/${video.contentVideoId}`}
                  className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg hover:scale-105 transition-transform"
                >
                  <Play className="ml-1 h-5 w-5 text-primary-foreground fill-primary-foreground" />
                </Link>
              )}
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {video.name}
                </h3>
              </div>

              {video.contentVideoId ? (
                <Link
                  to={`/content/${video.contentVideoId}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 transition-colors text-primary"
                >
                  Open Lesson & Quiz
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Processing video...
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
