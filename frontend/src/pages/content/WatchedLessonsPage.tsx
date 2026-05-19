import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  CalendarDays,
  CalendarRange,
  Loader2,
  Target,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import {
  CatalogVideoCard,
  type CatalogCardVideo,
} from "../../components/catalog/CatalogVideoCard";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { cn } from "../../lib/utils";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { formatMessage } from "../../lib/formatMessage";
import {
  fetchLearnerRecapStatus,
  formatRecapCooldown,
  type LearnerRecapStatusResponse,
  type RecapKind,
  type RecapStatusItem,
} from "../../lib/learnerRecap";
import { appEn } from "../../locales/app/en";
import { appUk } from "../../locales/app/uk";

interface ContentVideo {
  id: number;
  videoName: string;
  videoDescription: string | null;
  videoLink: string;
  thumbnailUrl?: string;
  content: {
    category: {
      name: string;
      description: string;
    };
  };
}

function toCardVideo(video: ContentVideo): CatalogCardVideo {
  return {
    id: video.id,
    title: video.videoName,
    categoryLabel: video.content.category.name,
    progress: 100,
    thumbnailUrl: video.thumbnailUrl,
    videoLink: video.videoLink,
  };
}

type RecapCardConfig = {
  kind: RecapKind;
  title: string;
  body: string;
  icon: typeof Target;
};

function RecapActionCard(props: {
  config: RecapCardConfig;
  status: RecapStatusItem | undefined;
  locale: string;
  labels: {
    start: string;
    cooldown: string;
    done: string;
    lastScore: string;
    lessons: string;
  };
}) {
  const { config, status, locale, labels } = props;
  const Icon = config.icon;
  const available = status?.available === true;
  const cooldown =
    !available && status?.nextAvailableAt
      ? formatRecapCooldown(status.nextAvailableAt, locale)
      : null;
  const ctaLabel = available
    ? labels.start
    : status?.completedInPeriod
      ? labels.done
      : cooldown
        ? formatMessage(labels.cooldown, { time: cooldown })
        : status?.reason ?? labels.done;

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-card/50 p-5 shadow-sm transition-colors",
        available
          ? "border-primary/30 hover:border-primary/50"
          : "border-border opacity-90",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="font-display text-base font-semibold tracking-tight">
          {config.title}
        </h3>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {config.body}
      </p>
      {status && status.lessonCount > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {formatMessage(labels.lessons, {
            count: String(status.lessonCount),
          })}
        </p>
      ) : null}
      {typeof status?.lastScorePct === "number" &&
      status.completedInPeriod ? (
        <p className="mt-1 text-xs font-medium text-foreground">
          {formatMessage(labels.lastScore, {
            score: String(Math.round(status.lastScorePct)),
          })}
        </p>
      ) : null}
      {available ? (
        <Link
          to={`/watched-lessons/recap/${config.kind}`}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {ctaLabel}
        </Link>
      ) : (
        <p
          className="mt-4 rounded-xl border border-dashed border-border px-4 py-2.5 text-center text-sm text-muted-foreground"
          role="status"
        >
          {ctaLabel}
        </p>
      )}
    </article>
  );
}

export default function WatchedLessonsPage() {
  const { user } = useUser();
  const { locale } = useLandingLocale();
  const M = locale === "uk" ? appUk.myLessonsPage : appEn.myLessonsPage;
  const browseCatalog =
    locale === "uk"
      ? appUk.catalogSpotlight.browseCatalog
      : appEn.catalogSpotlight.browseCatalog;

  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [recapStatus, setRecapStatus] = useState<LearnerRecapStatusResponse | null>(
    null,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const recapCards: RecapCardConfig[] = useMemo(
    () => [
      {
        kind: "mistakes",
        title: M.workOnMistakesTitle,
        body: M.workOnMistakesBody,
        icon: Target,
      },
      {
        kind: "weekly",
        title: M.weeklySummaryTitle,
        body: M.weeklySummaryBody,
        icon: CalendarDays,
      },
      {
        kind: "monthly",
        title: M.monthlySummaryTitle,
        body: M.monthlySummaryBody,
        icon: CalendarRange,
      },
    ],
    [M],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setHasLoadError(false);
      try {
        const [watchedRes, status] = await Promise.all([
          apiFetch("/content-video/watched", { method: "GET" }),
          fetchLearnerRecapStatus(),
        ]);
        if (cancelled) return;
        if (!watchedRes.ok) {
          setHasLoadError(true);
          setVideos([]);
        } else {
          const data: unknown = await watchedRes.json();
          setVideos(Array.isArray(data) ? (data as ContentVideo[]) : []);
        }
        setRecapStatus(status);
      } catch {
        if (!cancelled) {
          setHasLoadError(true);
          setVideos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = useMemo(() => videos.map(toCardVideo), [videos]);
  const recapLabels = useMemo(
    () => ({
      start: M.recapStartCta,
      cooldown: M.recapCooldown,
      done: M.recapDonePeriod,
      lastScore: M.recapLastScore,
      lessons: M.recapLessonsHint,
    }),
    [M],
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SEO
        title={M.heading}
        description={M.seoDescription}
        canonicalUrl={resolveCanonicalUrl("/watched-lessons")}
        noindex
      />
      <div className="flex">
        <CatalogSidebar
          categories={[]}
          selectedCategory="All"
          onSelectCategory={() => {}}
          onSelectLevel={() => {}}
          reserveTopNavSpace={false}
          welcomeName={
            user?.name?.trim() ? user.name.trim().split(/\s+/)[0] : undefined
          }
          englishLevel={user?.englishLevel || undefined}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <main
          className={cn(
            "ml-0 flex-1 pb-28 lg:pb-12",
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
          )}
        >
          <div className="border-border border-b bg-card/30 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <img src="/Icon.svg" className="h-18 w-15" alt="" />
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {M.heading}
                  </h1>
                  <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                    {M.subtitle}
                  </p>
                </div>
              </div>
              <Link
                to="/catalog"
                className="text-sm font-medium text-primary hover:underline"
              >
                {browseCatalog}
              </Link>
            </div>
          </div>

          <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
            <section className="space-y-4">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  {M.trainingHubTitle}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {M.trainingHubSubtitle}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {recapCards.map((cfg) => (
                  <RecapActionCard
                    key={cfg.kind}
                    config={cfg}
                    status={recapStatus?.[cfg.kind]}
                    locale={locale}
                    labels={recapLabels}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {M.completedTitle}
              </h2>
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2
                    className="h-12 w-12 animate-spin text-primary"
                    aria-hidden
                  />
                  <p className="text-sm text-muted-foreground">{M.loading}</p>
                </div>
              ) : hasLoadError ? (
                <p className="text-destructive text-center text-sm">
                  {M.loadError}
                </p>
              ) : cards.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
                  <p className="font-medium text-foreground">{M.emptyTitle}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {M.emptyHint}
                  </p>
                  <Link
                    to="/catalog"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {M.goToCatalog}
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((video) => (
                    <CatalogVideoCard key={video.id} video={video} showProgress />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

