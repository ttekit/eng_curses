import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  apiFetch,
  getApiBase,
  getResponseErrorMessage,
  getStoredAccessToken,
} from "../../lib/api";
import { useUser } from "../../context/UserContext";
import {
  subscriptionEnforcementDisabled,
  userMayUseLearnerApp,
} from "../../lib/subscriptionAccess";
import PlacementPreferencesStep from "../../components/PlacementPreferencesStep";
import PlacementPreTestStep, {
  adultNeedsPlacementPrepFields,
  studentNeedsPlacementPreferencesOverlay,
} from "../../components/PlacementPreTestStep";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { formatMessage } from "../../lib/formatMessage";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { CatalogHero } from "../../components/catalog/CatalogHero";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { CatalogVideoRow } from "../../components/catalog/CatalogVideoRow";
import {
  CatalogSpotlight,
  type CatalogSpotlightItem,
} from "../../components/catalog/CatalogSpotlight";
import type { CatalogCardVideo } from "../../components/catalog/CatalogVideoCard";
import { cn } from "../../lib/utils";
import {
  buildClientRecommendedVideos,
  fetchContentRecommendations,
  mapRecommendationsToCatalogCards,
} from "../../lib/contentRecommendations";
import { appEn } from "../../locales/app/en";
import { appUk } from "../../locales/app/uk";
import { Frown, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface ContentVideo {
  id: number;
  videoName: string;
  videoDescription: string | null;
  videoLink: string;
  thumbnailUrl?: string;
  playlistPosition?: number;
  content: {
    id: number;
    playlistPosition?: number;
    category: {
      id: number;
      name: string;
      description: string;
      friendlyLink: string;
    };
    stats?: {
      userTags?: string[];
      systemTags?: string[];
      topics?: { id: number; name: string }[];
    } | null;
  };
}

function toCardVideo(video: ContentVideo): CatalogCardVideo {
  return {
    id: video.id,
    title: video.videoName,
    categoryLabel: video.content.category.name,
    thumbnailUrl: video.thumbnailUrl,
    videoLink: video.videoLink,
  };
}

function placementPatchApiOrigin(html: string, apiOrigin: string): string {
  const trimmed = apiOrigin.replace(/\/$/, "");
  const esc = trimmed.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return html.replace(
    /<meta\s+name="explys-placement-api-origin"\s+content="[^"]*"\s*\/?\s*>/i,
    `<meta name="explys-placement-api-origin" content="${esc}" />`,
  );
}

const STRIPE_CHECKOUT_CATALOG_TOAST_ID = "stripe-checkout-catalog-welcome";

function stripCheckoutSuccessSearch(): { pathname: string; search: string } {
  const pathname = window.location.pathname;
  const p = new URLSearchParams(window.location.search);
  if (p.get("checkout") !== "success") {
    return { pathname, search: window.location.search };
  }
  p.delete("checkout");
  const q = p.toString();
  return { pathname, search: q ? `?${q}` : "" };
}

const LEVELS_LIST = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

export default function VideoPage() {
  const [videos, setVideos] = useState<ContentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [placementDocHtml, setPlacementDocHtml] = useState<string | null>(null);
  const [placementDocError, setPlacementDocError] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [recommendedCards, setRecommendedCards] = useState<CatalogCardVideo[]>(
    [],
  );
  const { user, isLoading: userLoading, refreshProfile } = useUser();
  const { messages, locale } = useLandingLocale();
  const catalogSeo = messages.catalogPage;
  const placementCompleteHandled = useRef(false);

  const cb = locale === "uk" ? appUk.catalogBrowse : appEn.catalogBrowse;

  const catalogCheckoutReturn = useMemo(() => {
    return new URLSearchParams(location.search).get("checkout") === "success";
  }, [location.search]);

  const activatingSubscriptionOverlay =
    catalogCheckoutReturn &&
    !subscriptionEnforcementDisabled() &&
    !!user &&
    !userMayUseLearnerApp(user);

  useEffect(() => {
    if (!catalogCheckoutReturn) return;

    let cancelled = false;

    void (async () => {
      const maxAttempts = 24;
      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) return;
        const profile = await refreshProfile();
        if (cancelled) return;
        if (profile && userMayUseLearnerApp(profile)) {
          const { pathname, search } = stripCheckoutSuccessSearch();
          void navigate({ pathname, search }, { replace: true });
          if (!import.meta.env.DEV) {
            toast.success(
              cb.stripeThanksToast || "Thank you for your purchase!",
              {
                id: STRIPE_CHECKOUT_CATALOG_TOAST_ID,
                duration: 6000,
              },
            );
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!cancelled) {
        const { pathname, search } = stripCheckoutSuccessSearch();
        void navigate({ pathname, search }, { replace: true });
        if (!import.meta.env.DEV) {
          toast.error(
            cb.stripeConfirmError || "Could not confirm subscription.",
            { duration: 8000, id: `${STRIPE_CHECKOUT_CATALOG_TOAST_ID}-err` },
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [catalogCheckoutReturn, navigate, refreshProfile]);

  const accessToken = getStoredAccessToken();
  const needsPlacement =
    !userLoading &&
    !!accessToken &&
    !!user &&
    user.role !== "teacher" &&
    user.role !== "admin" &&
    !user.hasCompletedPlacement;

  const placementPhaseResolved = useMemo((): "preferences" | "test" | "off" => {
    if (!needsPlacement || !user) return "off";
    if (user.role === "adult") {
      return adultNeedsPlacementPrepFields(user) ? "preferences" : "test";
    }
    if (user.role === "student") {
      return studentNeedsPlacementPreferencesOverlay(user)
        ? "preferences"
        : "test";
    }
    const hasPrefs =
      (user.hobbies?.length ?? 0) > 0 && (user.favoriteGenres?.length ?? 0) > 0;
    return hasPrefs ? "test" : "preferences";
  }, [
    needsPlacement,
    user,
    user?.hobbies,
    user?.favoriteGenres,
    user?.role,
    user?.teacherId,
    user?.nativeLanguage,
    user?.workField,
    user?.education,
    user?.englishLevel,
  ]);

  const showPlacementPrepOverlay =
    placementPhaseResolved === "preferences" && !!user;
  const showPlacementTest = placementPhaseResolved === "test" && !!accessToken;

  useEffect(() => {
    if (!needsPlacement) {
      placementCompleteHandled.current = false;
      return;
    }
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === "placement_exit") {
        navigate("/");
        return;
      }
      if (
        ev.data?.type === "placement_test_complete" &&
        !placementCompleteHandled.current
      ) {
        placementCompleteHandled.current = true;
        void (async () => {
          await refreshProfile();
          navigate("/learning-plan", { replace: true });
        })();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [needsPlacement, navigate, refreshProfile]);

  useEffect(() => {
    if (!showPlacementTest || !accessToken) {
      setPlacementDocHtml(null);
      setPlacementDocError(null);
      return;
    }
    let cancelled = false;
    setPlacementDocHtml(null);
    setPlacementDocError(null);
    void (async () => {
      try {
        const res = await apiFetch("/placement-test/document", {
          method: "GET",
        });
        if (!res.ok) {
          const msg = await getResponseErrorMessage(res);
          if (!cancelled) setPlacementDocError(msg);
          return;
        }
        const html = await res.text();
        if (!cancelled) {
          setPlacementDocHtml(
            placementPatchApiOrigin(html, getApiBase().replace(/\/$/, "")),
          );
          setPlacementDocError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setPlacementDocError(
            e instanceof Error
              ? e.message
              : cb.placementLoadError || "Failed to load placement test.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showPlacementTest, accessToken]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiFetch("/content-video", { method: "GET" });
        if (response.ok) setVideos(await response.json());
      } catch (error) {
        console.error("Error fetching video library:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const thumbnailByVideoId = useMemo(() => {
    const map = new Map<number, string | undefined>();
    for (const v of videos) {
      map.set(v.id, v.thumbnailUrl);
    }
    return map;
  }, [videos]);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (videos.length === 0) {
      setRecommendedCards([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      const userId = user?.id ? Number.parseInt(user.id, 10) : Number.NaN;
      let cards: CatalogCardVideo[] = [];

      if (Number.isFinite(userId) && userId > 0) {
        const data = await fetchContentRecommendations(userId);
        if (data?.recommendations?.length) {
          cards = mapRecommendationsToCatalogCards(
            data.recommendations,
            thumbnailByVideoId,
            12,
          );
        }
      }

      if (cards.length === 0) {
        cards = buildClientRecommendedVideos(videos, user ?? null, 12);
      }

      if (!cancelled) {
        setRecommendedCards(cards);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    videos,
    user,
    user?.id,
    user?.englishLevel,
    user?.hobbies,
    thumbnailByVideoId,
  ]);

  useEffect(() => {
    const raw = location.state as
      | { openSpotlight?: boolean }
      | null
      | undefined;
    if (raw?.openSpotlight) {
      setSpotlightOpen(true);
      void navigate(
        {
          pathname: location.pathname,
          search: location.search,
        },
        { replace: true, state: {} },
      );
    }
  }, [location.state, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (needsPlacement || showPlacementPrepOverlay || showPlacementTest) return;
    if (spotlightOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() !== "k") return;
      const t = e.target as HTMLElement | null;
      const inField = t?.closest?.(
        "input, textarea, select, [contenteditable]",
      );
      if (inField) return;
      e.preventDefault();
      setSpotlightOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    needsPlacement,
    showPlacementPrepOverlay,
    showPlacementTest,
    spotlightOpen,
  ]);

  const spotlightVideos: CatalogSpotlightItem[] = useMemo(() => {
    return videos.map((v) => ({
      id: v.id,
      title: v.videoName,
      category: v.content.category.name,
      description: v.videoDescription ?? null,
      thumbnailUrl: v.thumbnailUrl,
      videoLink: v.videoLink,
    }));
  }, [videos]);

  const categoryNames = useMemo(() => {
    const names = videos.map((v) => v.content.category.name);
    return [...new Set(names)];
  }, [videos]);

  const genreNames = useMemo(() => {
    const tags = new Set<string>();
    videos.forEach((v) => {
      v.content.stats?.userTags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [videos]);

  const sortedGenres = useMemo(() => {
    return ["All", ...genreNames.filter(Boolean)];
  }, [genreNames]);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchCategory =
        selectedCategory === "All" ||
        v.content.category.name === selectedCategory;
      const matchLevel =
        selectedLevel === "All" ||
        (v.content.stats?.systemTags &&
          v.content.stats.systemTags.includes(selectedLevel));
      const matchGenre =
        selectedGenre === "All" ||
        (v.content.stats?.userTags &&
          v.content.stats.userTags.includes(selectedGenre));
      return matchCategory && matchLevel && matchGenre;
    });
  }, [videos, selectedCategory, selectedLevel, selectedGenre]);

  const featured = filteredVideos[0] ?? null;
  const featuredHero = useMemo(() => {
    return featured
      ? {
          id: featured.id,
          title: featured.videoName,
          description:
            featured.videoDescription ??
            featured.content.category.description ??
            "",
          categoryName: featured.content.category.name,
          thumbnailUrl: featured.thumbnailUrl,
        }
      : null;
  }, [featured]);

  const catalogRows = useMemo(() => {
    if (filteredVideos.length === 0) return [];
    if (
      selectedCategory !== "All" ||
      selectedLevel !== "All" ||
      selectedGenre !== "All"
    ) {
      const sorted = [...filteredVideos].sort((a, b) => {
        const ma =
          typeof a.content.playlistPosition === "number"
            ? a.content.playlistPosition
            : 0;
        const mb =
          typeof b.content.playlistPosition === "number"
            ? b.content.playlistPosition
            : 0;
        if (ma !== mb) return ma - mb;
        const va =
          typeof a.playlistPosition === "number" ? a.playlistPosition : 0;
        const vb =
          typeof b.playlistPosition === "number" ? b.playlistPosition : 0;
        if (va !== vb) return va - vb;
        return a.id - b.id;
      });
      const link = sorted[0]?.content.category.friendlyLink?.trim() ?? "";

      let dynamicTitle =
        selectedCategory !== "All" ? selectedCategory : "Filtered Results";
      if (selectedLevel !== "All") dynamicTitle += ` - ${selectedLevel}`;
      if (selectedGenre !== "All") dynamicTitle += ` - ${selectedGenre}`;

      return [
        {
          title: dynamicTitle,
          description: undefined as string | undefined,
          seriesFriendlyLink: link.length > 0 ? link : undefined,
          videos: sorted.map(toCardVideo),
        },
      ];
    }
    const byCategory = new Map<string, ContentVideo[]>();
    for (const v of filteredVideos) {
      const key = v.content.category.name;
      const bucket = byCategory.get(key);
      if (bucket) bucket.push(v);
      else byCategory.set(key, [v]);
    }
    return [...byCategory.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, list]) => {
        const sorted = [...list].sort((a, b) => {
          const ma =
            typeof a.content.playlistPosition === "number"
              ? a.content.playlistPosition
              : 0;
          const mb =
            typeof b.content.playlistPosition === "number"
              ? b.content.playlistPosition
              : 0;
          if (ma !== mb) return ma - mb;
          const va =
            typeof a.playlistPosition === "number" ? a.playlistPosition : 0;
          const vb =
            typeof b.playlistPosition === "number" ? b.playlistPosition : 0;
          if (va !== vb) return va - vb;
          return a.id - b.id;
        });
        const link = sorted[0]?.content.category.friendlyLink?.trim() ?? "";
        return {
          title,
          description: undefined as string | undefined,
          seriesFriendlyLink: link.length > 0 ? link : undefined,
          videos: sorted.map(toCardVideo),
        };
      });
  }, [filteredVideos, selectedCategory, selectedLevel, selectedGenre]);

  const visibleRecommended = useMemo(() => {
    if (recommendedCards.length === 0) {
      return [];
    }
    const allowedIds = new Set(filteredVideos.map((v) => v.id));
    return recommendedCards.filter((card) => allowedIds.has(card.id));
  }, [recommendedCards, filteredVideos]);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground antialiased flex-col">
      {activatingSubscriptionOverlay ? (
        <div
          className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
          <p className="text-muted-foreground text-sm">
            {cb.activatingSubscription || "Activating your subscription..."}
          </p>
        </div>
      ) : null}
      <SEO
        title={catalogSeo?.title || "Catalog"}
        description={catalogSeo?.description || "Explys Catalog"}
        canonicalUrl={resolveCanonicalUrl("/catalog")}
        ogLocale={locale === "uk" ? "uk_UA" : "en_US"}
        ogLocaleAlternate={locale === "uk" ? "en_US" : "uk_UA"}
      />
      <div>
        <div className="flex w-full">
          <CatalogSidebar
            categories={categoryNames}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            genres={genreNames}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            welcomeName={user?.name ? user.name.split(" ")[0] : undefined}
            englishLevel={user?.englishLevel || undefined}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            catalogSpotlightOpen={spotlightOpen}
            onOpenCatalogSpotlight={() => setSpotlightOpen(true)}
            reserveTopNavSpace={false}
          />

          <main
            className={cn(
              "flex-1 pb-24 transition-all duration-300 font-display lg:pb-8",
              sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
            )}
            style={{
              maxWidth: sidebarCollapsed
                ? "calc(100vw - 5rem)"
                : "calc(100vw - 16rem)",
            }}
          >
            <CatalogHero featured={featuredHero} />

            {/* Filters */}
            <div className="px-4 sm:px-6 lg:px-8 space-y-4 mt-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6 border-b border-border/60 pb-6">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="size-3.5" /> Level
                  </span>
                  <div className="relative">
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-linear-to-l from-background to-transparent z-10" />
                    <div
                      className="flex gap-1.5 overflow-x-auto pb-1"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {LEVELS_LIST.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedLevel(lvl)}
                          className={cn(
                            "ml-0.5 rounded-full shrink-0 px-4 py-1.5 text-xs font-semibold transition-all hover:cursor-pointer",
                            selectedLevel === lvl
                              ? "bg-primary text-primary-foreground scale-105 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
                              : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {genreNames.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <img
                        src="/Icon.svg"
                        className="size-3.5 grayscale opacity-70"
                        alt=""
                      />{" "}
                      Genre
                    </span>
                    <div className="relative">
                      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-linear-to-l from-background to-transparent z-10" />
                      <div
                        className="flex gap-1.5 overflow-x-auto pb-1"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        {sortedGenres.map((gen) => (
                          <button
                            key={gen}
                            type="button"
                            onClick={() => setSelectedGenre(gen)}
                            className={cn(
                              "ml-0.5 rounded-full px-4 shrink-0 py-1.5 text-xs font-semibold transition-all hover:cursor-pointer",
                              selectedGenre === gen
                                ? "bg-accent text-accent-foreground scale-105 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
                                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground ",
                            )}
                          >
                            {gen}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              id="catalog-library"
              className="space-y-10 px-4 sm:px-6 lg:px-8 pt-2"
            >
              {loading ? (
                <div className="flex h-60 bg-card/30 flex-col items-center rounded-[30px] justify-center space-y-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent border-b-transparent" />
                  <p className="animate-pulse text-muted-foreground text-sm">
                    {(messages.catalogPage as any)?.loadingCatalog ||
                      "Loading catalog..."}
                  </p>
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className=" flex flex-col rounded-[30px] bg-card/30 py-15 text-center justify-center items-center">
                  <img src="/SadIcon.svg" className="w-25 h-30 mb-3" />
                  <h2 className="font-display text-2xl font-bold">
                    {(messages.catalogPage as any)?.emptyTitle ||
                      "No lessons found"}
                  </h2>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {videos.length === 0
                      ? (messages.catalogPage as any)?.emptyNoVideos ||
                        "There are no videos in the catalog yet."
                      : (messages.catalogPage as any)?.emptyFiltered ||
                        "No videos match your filters."}
                  </p>
                </div>
              ) : (
                <>
                  {visibleRecommended.length > 0 ? (
                    <CatalogVideoRow
                      title={cb.recommendedTitle}
                      description={cb.recommendedDescription}
                      videos={visibleRecommended}
                    />
                  ) : null}
                  {catalogRows.map((row) => (
                    <CatalogVideoRow
                      key={row.title}
                      title={row.title}
                      description={row.description}
                      seriesFriendlyLink={row.seriesFriendlyLink}
                      videos={row.videos}
                    />
                  ))}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {showPlacementPrepOverlay ? (
        <div className="fixed inset-0 z-200 font-display flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
          <header className="shrink-0 border-border border-b bg-background">
            <div className="mx-auto grid w-full max-w-4xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4">
              <div aria-hidden="true" />
              <div className="flex items-center gap-2">
                <img src="/Icon.svg" className="w-10 h-13" />
                <span className="font-display text-lg font-bold tracking-tight text-foreground">
                  Explys
                </span>
              </div>
              <span className="justify-self-end text-sm text-muted-foreground">
                {cb.placementStepCounter || "Step 1 of 2"}
              </span>
            </div>
          </header>
          <div className="mx-auto w-full max-w-4xl shrink-0 px-4 py-6">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={50}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={cb.placementProgressAria || "Placement progress"}
            >
              <div className="h-full w-1/2 rounded-full bg-primary transition-all" />
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto mb-4 w-full max-w-2xl flex flex-col min-h-0 bg-card border border-border rounded-3xl overflow-scroll">
              <div className="mx-auto w-full max-w-md shrink-0 px-4 pt-2 pb-2">
                <h2 className="font-display text-xl font-semibold mt-1 tracking-tight text-foreground">
                  {cb.beforeEntryTitle || "Before you start"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user?.role === "adult"
                    ? cb.beforeEntryAdult || "Let's set up your profile."
                    : user?.role === "student" && user?.teacherId == null
                      ? cb.beforeEntryIndependentStudent ||
                        "Let's personalize your learning."
                      : cb.beforeEntryStudent || "Let's get everything ready."}
                </p>
              </div>
              <div className="flex-1 pb-6">
                {user ? (
                  user.role === "adult" ? (
                    <PlacementPreTestStep
                      user={user}
                      onSuccess={(detail) => {
                        if (detail?.skippedPlacementTest) {
                          navigate("/learning-plan", { replace: true });
                        }
                      }}
                    />
                  ) : (
                    <PlacementPreferencesStep
                      user={user}
                      onSuccess={() => undefined}
                    />
                  )
                ) : null}
              </div>
            </div>

            <footer className="shrink-0 border-border border-t bg-card">
              <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <img src="/Icon.svg" className="w-8 h-10" />
                    <span className="font-display text-lg font-bold tracking-tight text-foreground">
                      Explys
                    </span>
                  </div>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    {cb.placementFooterBlurb ||
                      "Explys placement test personalization."}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {formatMessage(cb.placementCopyright || "© {year} Explys", {
                    year: String(new Date().getFullYear()),
                  })}
                </p>
              </div>
            </footer>
          </div>
        </div>
      ) : null}

      {showPlacementTest ? (
        <div className="fixed inset-0 z-200 flex flex-col bg-background">
          {placementDocError ? (
            <div
              className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
              role="alert"
            >
              <p className="text-destructive text-sm font-medium">
                {cb.couldNotLoadPlacement || "Could not load placement test."}
              </p>
              <p className="text-muted-foreground max-w-md text-sm">
                {placementDocError}
              </p>
            </div>
          ) : placementDocHtml ? (
            <iframe
              key="placement-entry-test"
              title={cb.placementTestTitle || "Placement Test"}
              className="min-h-0 w-full flex-1 border-0 bg-background"
              srcDoc={placementDocHtml}
              onLoad={() => {
                try {
                  if (typeof console !== "undefined" && console.log) {
                    console.log("[placement:parent]", "iframe onLoad (srcDoc)");
                  }
                } catch {
                  /* */
                }
              }}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-solid border-primary border-t-4 border-r-transparent border-b-transparent border-l-transparent" />
              <p className="text-muted-foreground text-sm">
                {cb.loadingPlacement || "Loading placement test..."}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {!needsPlacement && !showPlacementPrepOverlay && !showPlacementTest ? (
        <CatalogSpotlight
          open={spotlightOpen}
          onClose={() => setSpotlightOpen(false)}
          videos={spotlightVideos}
        />
      ) : null}
    </div>
  );
}
