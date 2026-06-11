import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Clock,
  CreditCard,
  GraduationCap,
  Settings,
  Trophy,
  Video,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import { cn } from "../../lib/utils";
import type {
  ProfileHeaderModel,
  ProfileHeaderRole,
} from "../../components/profile/ProfileHeader";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import {
  DEFAULT_WEEKLY_ACTIVITY,
  type ProfileStatsModel,
} from "../../components/profile/ProfileStats";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { ProfileProgress } from "../../components/profile/ProfileProgress";
import { ProfileAchievements } from "../../components/profile/ProfileAchievements";
import {
  ProfileActivity,
  type ActivityLogItem,
} from "../../components/profile/ProfileActivity";
import { ProfileSettings } from "../../components/profile/ProfileSettings";
import { ProfileTeacherStudents } from "../../components/profile/ProfileTeacherStudents";
import { ProfileTeacherVideos } from "../../components/profile/ProfileTeacherVideos";
import { ProfileStudyingPlan } from "../../components/profile/ProfileStudyingPlan";
import { ProfileSubscriptions } from "../../components/profile/ProfileSubscriptions";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { useAppMessages } from "../../hooks/useAppMessages";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { ThemeToggle } from "../../components/ThemeToggle";

const LEARNER_TAB_DEFS = [
  { id: "overview" as const, icon: BarChart3 },
  { id: "studying-plan" as const, icon: ClipboardList },
  { id: "subscriptions" as const, icon: CreditCard },
  { id: "progress" as const, icon: BookOpen },
  { id: "achievements" as const, icon: Trophy },
  { id: "activity" as const, icon: Clock },
  { id: "settings" as const, icon: Settings },
] as const;

type TabId = (typeof LEARNER_TAB_DEFS)[number]["id"] | "students" | "videos";

function normalizeRole(role: string): ProfileHeaderRole {
  const k = role.trim().toLowerCase();
  if (k === "student" || k === "teacher" || k === "admin") return k;
  return "adult";
}

type LearningStatsPayload = {
  totalWatchTimeMin: number;
  videosCompleted: number;
  testsCompleted: number;
  averageScore: number | null;
  weeklyActivity: { day: string; minutes: number }[];
};

export default function ProfileMain() {
  const { user, isLoading, isLoggedIn, refreshProfile } = useUser();
  const { locale } = useLandingLocale();
  const profile = useAppMessages().profile;
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [joinMeta, setJoinMeta] = useState<{
    userId: string;
    label: string;
  } | null>(null);
  const [learningStats, setLearningStats] =
    useState<LearningStatsPayload | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;
    let cancelled = false;
    void (async () => {
      const r = await apiFetch(`/users/${Number(uid)}`, {
        method: "GET",
      });
      if (!r.ok || cancelled) return;
      const j: unknown = await r.json();
      if (!j || typeof j !== "object") return;
      const createdAt = (j as { createdAt?: unknown }).createdAt;
      if (typeof createdAt !== "string") return;
      const d = new Date(createdAt);
      if (Number.isNaN(d.getTime()) || cancelled) return;
      setJoinMeta({
        userId: uid,
        label: d.toLocaleDateString(locale === "uk" ? "uk-UA" : "en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, locale]);

  useEffect(() => {
    if (!user?.id || (activeTab !== "overview" && activeTab !== "activity"))
      return;
    let cancelled = false;
    void (async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          apiFetch("/profile/learning-stats", { method: "GET" }),
          activeTab === "activity"
            ? apiFetch("/profile/activity-log", { method: "GET" })
            : Promise.resolve(null),
        ]);

        if (!cancelled) {
          if (statsRes.ok) {
            const o = (await statsRes.json()) as Record<string, unknown>;
            const weekly = o.weeklyActivity;
            setLearningStats({
              totalWatchTimeMin: Number(o.totalWatchTimeMin ?? 0) || 0,
              videosCompleted: Number(o.videosCompleted ?? 0) || 0,
              testsCompleted: Number(o.testsCompleted ?? 0) || 0,
              averageScore:
                o.averageScore === null || o.averageScore === undefined
                  ? null
                  : Number(o.averageScore),
              weeklyActivity: Array.isArray(weekly)
                ? (weekly as { day: string; minutes: number }[])
                : [...DEFAULT_WEEKLY_ACTIVITY],
            });
          }

          if (logsRes && logsRes.ok) {
            const logsData = await logsRes.json();
            if (Array.isArray(logsData)) {
              setActivityLogs(logsData);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile stats/logs", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, activeTab]);

  const joinDateLabel =
    user?.id && joinMeta?.userId === user.id ? joinMeta.label : null;

  const headerModel: ProfileHeaderModel | null = useMemo(() => {
    if (!user) return null;
    return {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: normalizeRole(user.role),
      level: user.englishLevel?.trim() || "—",
      joinDateLabel,
      streakDays: (user as any).currentStreak || 0,
    };
  }, [user, joinDateLabel]);

  const statsModel: ProfileStatsModel | null = useMemo(() => {
    if (!user) return null;
    const s = learningStats;
    return {
      totalWatchTimeMin: s?.totalWatchTimeMin ?? 0,
      videosCompleted: s?.videosCompleted ?? 0,
      testsCompleted: s?.testsCompleted ?? 0,
      averageScore:
        s?.averageScore != null && Number.isFinite(s.averageScore)
          ? s.averageScore
          : null,
      weeklyActivity: s?.weeklyActivity ?? [...DEFAULT_WEEKLY_ACTIVITY],
      levelLabel: user.englishLevel?.trim() || "A1",
      xp: user.xp || 0,
      appLevel: Math.floor((user.xp || 0) / 1000) + 1,
    };
  }, [user, learningStats]);

  const tabs = useMemo(() => {
    const tabLabels: Record<TabId, string> = {
      overview: profile.tabOverview,
      "studying-plan": profile.tabStudyingPlan,
      subscriptions: profile.tabSubscriptions,
      progress: profile.tabProgress,
      achievements: profile.tabAchievements,
      activity: profile.tabActivity,
      settings: profile.tabSettings,
      students: profile.tabStudents,
      videos: profile.tabVideos,
    };
    const withLabels = LEARNER_TAB_DEFS.map((tab) => ({
      ...tab,
      label: tabLabels[tab.id],
    }));
    if (user?.role === "teacher") {
      const withoutStudying = withLabels.filter(
        (t) => t.id !== "studying-plan",
      );
      return [
        withoutStudying[0],
        {
          id: "students" as const,
          label: profile.tabStudents,
          icon: GraduationCap,
        },
        {
          id: "videos" as const,
          label: profile.tabVideos,
          icon: Video,
        },
        ...withoutStudying.slice(1),
      ];
    }
    return [...withLabels];
  }, [user?.role, profile]);

  useEffect(() => {
    if (!user) return;
    const t = searchParams.get("tab");
    const validIds = new Set<string>(tabs.map((tb) => tb.id));
    if (t && validIds.has(t)) {
      setActiveTab(t as TabId);
      return;
    }
    if (t && !validIds.has(t)) {
      setActiveTab("overview");
      setSearchParams({}, { replace: true });
      return;
    }
    if (!t) setActiveTab("overview");
  }, [user, searchParams, tabs, setSearchParams]);

  useEffect(() => {
    if (user?.role !== "teacher" && activeTab === "students") {
      setActiveTab("overview");
      setSearchParams({}, { replace: true });
    }
  }, [user?.role, activeTab, setSearchParams]);

  useEffect(() => {
    if (user?.role !== "teacher" && activeTab === "videos") {
      setActiveTab("overview");
      setSearchParams({}, { replace: true });
    }
  }, [user?.role, activeTab, setSearchParams]);

  useEffect(() => {
    if (user?.role === "teacher" && activeTab === "studying-plan") {
      setActiveTab("overview");
      setSearchParams({}, { replace: true });
    }
  }, [user?.role, activeTab, setSearchParams]);

  if (isLoading) {
    return (
      <>
        <SEO
          title={profile.seoTitle}
          description={profile.seoDescription}
          canonicalUrl={resolveCanonicalUrl("/profileMain")}
          noindex
        />
        <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
          {profile.loading}
        </div>
      </>
    );
  }

  if (!isLoggedIn || !user || !headerModel || !statsModel) {
    return (
      <>
        <SEO
          title={profile.seoTitle}
          description={profile.seoDescription}
          canonicalUrl={resolveCanonicalUrl("/profileMain")}
          noindex
        />
        <div className="m-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          <p className="font-medium">{profile.signInPrompt}</p>
          <Link
            to="/loginForm"
            className="mt-3 inline-block text-primary underline-offset-4 hover:underline"
          >
            {profile.goToLogin}
          </Link>
        </div>
      </>
    );
  }

  function selectTab(id: TabId) {
    setActiveTab(id);
    if (id === "overview") setSearchParams({}, { replace: true });
    else setSearchParams({ tab: id }, { replace: true });
  }

  return (
    <div className="min-h-dvh bg-background font-display antialiased">
      <SEO
        title={profile.seoTitle}
        description={profile.seoDescription}
        canonicalUrl={resolveCanonicalUrl("/profileMain")}
        noindex
      />
      <div className="flex">
        <CatalogSidebar
          onSelectLevel={() => {}}
          reserveTopNavSpace={false}
          welcomeName={
            user?.name?.trim() ? user.name.trim().split(/\s+/)[0] : undefined
          }
          englishLevel={user?.englishLevel || undefined}
          avatarUrl={user?.avatarUrl}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <main
          className={cn(
            "flex-1 pb-24 pt-6 transition-all duration-300 sm:px-6 lg:pb-12 lg:pt-8",
            sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
          )}
        >
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <ProfileHeader user={headerModel} />

            {user?.role?.toLowerCase() === "student" &&
              ((user as any).teacherName || user.className) && (
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-primary/10 px-5 py-3 border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                    <GraduationCap className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    {user.className && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Class
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          <strong className="font-bold text-primary">
                            {user.className}
                          </strong>
                        </p>
                      </div>
                    )}
                    {(user as any).teacherName && (
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          {profile.yourTeacher || "Your Teacher"}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          <strong className="font-bold text-primary">
                            {(user as any).teacherName}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            <div
              className="mt-8 flex flex-wrap items-center gap-1 rounded-xl bg-secondary/50 p-1"
              role="tablist"
              aria-label={profile.tabListAria}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectTab(tab.id)}
                    className={cn(
                      "inline-flex hover:cursor-pointer flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:flex-none sm:justify-start",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}

              <div className="ml-auto pl-2 pr-1">
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "overview" ? (
                <ProfileStats user={statsModel} />
              ) : null}
              {activeTab === "studying-plan" ? (
                <ProfileStudyingPlan user={user} />
              ) : null}
              {activeTab === "subscriptions" ? (
                <ProfileSubscriptions user={user} />
              ) : null}
              {activeTab === "students" ? <ProfileTeacherStudents /> : null}
              {activeTab === "videos" ? <ProfileTeacherVideos /> : null}
              {activeTab === "progress" ? <ProfileProgress /> : null}
              {activeTab === "achievements" ? <ProfileAchievements /> : null}
              {activeTab === "activity" ? (
                <ProfileActivity
                  weeklyActivity={learningStats?.weeklyActivity}
                  videosWatched={learningStats?.videosCompleted}
                  testsCompleted={learningStats?.testsCompleted}
                  averageScore={learningStats?.averageScore}
                  activityLogs={activityLogs}
                />
              ) : null}
              {activeTab === "settings" ? (
                <ProfileSettings
                  onSaved={async () => {
                    await refreshProfile();
                  }}
                />
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
