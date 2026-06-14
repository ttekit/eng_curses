import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { ProfileCard } from "./ProfileCard";
import { cn } from "../../lib/utils";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import { pct01, SkillBar } from "./KnowledgeMeters";
import { subscriptionDevModeEnabled } from "../../lib/subscriptionAccess";
import { useAppMessages } from "../../hooks/useAppMessages";

type KnowledgeTagRow = {
  name: string;
  score: number;
  listening: number;
  vocabulary: number;
  grammar: number;
  topicCount: number;
};

function parseKnowledgeTagsPayload(raw: unknown): KnowledgeTagRow[] {
  if (!raw || typeof raw !== "object") {
    return [];
  }
  const tags = (raw as { tags?: unknown }).tags;
  if (!Array.isArray(tags)) {
    return [];
  }
  const parsed: KnowledgeTagRow[] = [];
  for (const row of tags) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const o = row as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) {
      continue;
    }
    parsed.push({
      name,
      score: Number(o.score) || 0,
      listening: Number(o.listening) || 0,
      vocabulary: Number(o.vocabulary) || 0,
      grammar: Number(o.grammar) || 0,
      topicCount: Number(o.topicCount) || 0,
    });
  }
  return parsed;
}

type ProgressDetails = {
  vocabularyProgress: {
    total: number;
    learned: number;
    mastered: number;
    reviewing: number;
  };
  recentVideos: {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    score: number;
    progress?: number;
  }[];
  learningPaths: {
    id: string;
    title: string;
    description: string;
    progress: number;
    totalVideos: number;
    completedVideos: number;
    level: string;
    accentClass: string;
  }[];
};

export function ProfileProgress() {
  const { user } = useUser();
  const p = useAppMessages().profileProgress;
  const [tagRows, setTagRows] = useState<KnowledgeTagRow[] | null>(null);
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [isRefreshingTags, setIsRefreshingTags] = useState(false);
  const [details, setDetails] = useState<ProgressDetails | null>(null);
  const showDevRefresh = subscriptionDevModeEnabled();

  const loadKnowledgeTags = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      return;
    }
    setTagsError(null);
    const r = await apiFetch("/auth/profile/knowledge-tags", {
      method: "GET",
    });
    if (!r.ok) {
      setTagRows([]);
      setTagsError(p.tagsError);
      return;
    }
    const raw: unknown = await r.json();
    setTagRows(parseKnowledgeTagsPayload(raw));
  }, [user?.id, p.tagsError]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    let cancelled = false;
    void (async () => {
      await loadKnowledgeTags();
      if (cancelled) {
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, loadKnowledgeTags]);

  async function refreshKnowledgeTags(): Promise<void> {
    if (!user?.id || isRefreshingTags) {
      return;
    }
    setIsRefreshingTags(true);
    setTagsError(null);
    try {
      const r = await apiFetch("/auth/profile/refresh-knowledge-tags", {
        method: "POST",
      });
      if (!r.ok) {
        setTagsError(await getResponseErrorMessage(r));
        return;
      }
      const raw: unknown = await r.json();
      setTagRows(parseKnowledgeTagsPayload(raw));
    } catch (err) {
      setTagsError(err instanceof Error ? err.message : p.tagsError);
    } finally {
      setIsRefreshingTags(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void (async () => {
      const r = await apiFetch("/auth/profile/progress-details", {
        method: "GET",
      });
      if (!r.ok || cancelled) return;
      const data = await r.json();
      setDetails(data as ProgressDetails);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const visibleTags = tagRows
    ? isTagsExpanded
      ? tagRows
      : tagRows.slice(0, 4)
    : [];

  return (
    <div className="space-y-6">
      <ProfileCard
        title={p.knowledgeByTag}
        action={
          showDevRefresh ? (
            <button
              type="button"
              onClick={() => void refreshKnowledgeTags()}
              disabled={isRefreshingTags || tagRows === null}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/30 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60 disabled:pointer-events-none disabled:opacity-50"
            >
              {isRefreshingTags ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-3.5" aria-hidden />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </button>
          ) : undefined
        }
      >
        {tagRows === null ? (
          <p className="text-sm text-muted-foreground">{p.loadingTags}</p>
        ) : tagsError ? (
          <p className="text-sm text-destructive">{tagsError}</p>
        ) : tagRows.length === 0 ? (
          <p className="text-sm text-muted-foreground break-words whitespace-normal">
            {p.noTagsBodyBeforeLink}{" "}
            <Link
              to="/catalog"
              className="text-primary underline-offset-4 hover:underline break-words"
              aria-label={p.catalogLinkAria}
            >
              {p.noTagsCatalogLink}
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-4">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleTags.map((row) => (
                <li
                  key={row.name}
                  className="rounded-xl border border-border/40 bg-secondary/25 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-medium text-foreground line-clamp-2 break-words"
                        title={row.name}
                      >
                        {row.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 break-words">
                        {p.averagedOver} {row.topicCount}{" "}
                        {row.topicCount === 1 ? p.topicsOne : p.topicsMany}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 text-sm font-semibold tabular-nums text-primary">
                      {pct01(row.score)}%
                    </span>
                  </div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {p.skillOverall}
                  </p>
                  <div className="mb-3 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct01(row.score)}%` }}
                    />
                  </div>
                  <div className="space-y-2.5 pt-1">
                    <SkillBar
                      label={p.listening}
                      value={row.listening}
                      barClass="bg-sky-500/80 dark:bg-sky-400/90"
                    />
                    <SkillBar
                      label={p.vocabulary}
                      value={row.vocabulary}
                      barClass="bg-violet-500/80 dark:bg-violet-400/85"
                    />
                    <SkillBar
                      label={p.grammar}
                      value={row.grammar}
                      barClass="bg-amber-500/75 dark:bg-amber-400/80"
                    />
                  </div>
                </li>
              ))}
            </ul>
            {tagRows.length > 4 && (
              <button
                onClick={() => setIsTagsExpanded((prev) => !prev)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/40 bg-secondary/20 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50"
              >
                {isTagsExpanded ? (
                  <>
                    Show less <ChevronUp className="size-4" />
                  </>
                ) : (
                  <>
                    Show all {tagRows.length} tags <ChevronDown className="size-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </ProfileCard>

      <ProfileCard
        title={p.recentVideos}
        action={
          <Link
            to="/catalog"
            className="text-sm font-medium text-primary hover:underline shrink-0 ml-2"
          >
            {p.viewAll}
          </Link>
        }
      >
        <div className="space-y-3">
          {(details?.recentVideos || []).map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-3 sm:gap-4 rounded-lg p-2 sm:p-3 transition-colors hover:bg-secondary/30"
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  video.completed
                    ? "bg-accent/20"
                    : (video.progress ?? 0) > 0
                      ? "bg-primary/20"
                      : "bg-secondary",
                )}
              >
                {video.completed ? (
                  <CheckCircle className="size-5 text-accent" />
                ) : (video.progress ?? 0) > 0 ? (
                  <PlayCircle className="size-5 text-primary" />
                ) : (
                  <Lock className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="font-medium text-foreground line-clamp-1 break-words"
                  title={video.title}
                >
                  {video.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1 break-words">
                  {video.category}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {video.completed ? (
                  <span className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                    {p.scorePrefix} {video.score}%
                  </span>
                ) : (video.progress ?? 0) > 0 ? (
                  <span className="text-sm text-muted-foreground">
                    {video.progress}%
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {p.notStartedStatus}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ProfileCard>

      <ProfileCard title={p.vocabularyProgress}>
        {details?.vocabularyProgress && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl bg-secondary/30 p-3 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {details.vocabularyProgress.total}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words whitespace-normal leading-tight">
                  {p.vocabTotalWords}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 p-3 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">
                  {details.vocabularyProgress.learned}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words whitespace-normal leading-tight">
                  {p.vocabLearned}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-accent/10 p-3 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-accent">
                  {details.vocabularyProgress.mastered}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words whitespace-normal leading-tight">
                  {p.vocabMastered}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 p-3 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  {details.vocabularyProgress.reviewing}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words whitespace-normal leading-tight">
                  {p.vocabReviewing}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm gap-2">
                <span className="text-muted-foreground break-words whitespace-normal leading-tight">
                  {p.overallProgressLabel}
                </span>
                <span className="font-medium text-foreground shrink-0">
                  {Math.round(
                    (details.vocabularyProgress.learned /
                      Math.max(details.vocabularyProgress.total, 1)) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-accent"
                  style={{
                    width: `${(details.vocabularyProgress.mastered / Math.max(details.vocabularyProgress.total, 1)) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${((details.vocabularyProgress.learned - details.vocabularyProgress.mastered) / Math.max(details.vocabularyProgress.total, 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-4">
                <span className="inline-flex items-center gap-1 shrink-0">
                  <span className="size-2 shrink-0 rounded-full bg-accent" />{" "}
                  {p.legendMastered}
                </span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <span className="size-2 shrink-0 rounded-full bg-primary" />{" "}
                  {p.legendLearning}
                </span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <span className="size-2 shrink-0 rounded-full bg-secondary" />{" "}
                  {p.legendRemaining}
                </span>
              </div>
            </div>
          </>
        )}
      </ProfileCard>
    </div>
  );
}