import { Link, useLocation, useSearchParams } from "react-router";
import { cn } from "../../lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Search,
  Settings,
  SlidersHorizontal,
  Trophy,
  User,
  GraduationCap,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import type { UserData } from "../../context/UserContext";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import { ThemeToggle } from "../ThemeToggle";
import { LearnerCustomiseFab } from "./LearnerCustomiseFab";

const sidebarLinkDefs = [
  { id: "catalog" as const, icon: LayoutGrid, to: "/catalog" },
  { id: "search" as const, icon: Search, to: "/catalog" },
  { id: "classroom" as const, icon: GraduationCap, to: "/classroom" },
  { id: "myLessons" as const, icon: BookOpen, to: "/watched-lessons" },
  { id: "customise" as const, icon: SlidersHorizontal, to: "/customise" },
  { id: "profile" as const, icon: User, to: "/profile" },
  { id: "leaderboard" as const, icon: Trophy, to: "/leaderboard" },
] as const;

type SidebarLinkId = (typeof sidebarLinkDefs)[number]["id"];

function shouldShowClassroomNav(user: UserData | null | undefined): boolean {
  if (!user) {
    return false;
  }
  const role = user.role?.toLowerCase();
  if (role === "teacher" || role === "admin") {
    return true;
  }
  return user.teacherId != null && user.teacherId > 0;
}

function resolveVisibleSidebarLinks(user: UserData | null | undefined) {
  return sidebarLinkDefs.filter((link) => {
    if (link.id === "customise") {
      return false;
    }
    if (link.id === "classroom") {
      return shouldShowClassroomNav(user);
    }
    return true;
  });
}

const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

function resolve_sidebar_top_class(reserveTopNavSpace: boolean): string {
  if (reserveTopNavSpace) {
    return "top-[calc(var(--email-verification-banner-height,0px)+4.5rem)]";
  }
  return "top-[var(--email-verification-banner-height,0px)]";
}

interface CatalogSidebarProps {
  // welcomeName?: string;
  // englishLevel?: string;
  // avatarUrl?: string;
  selectedLevel?: string;
  onSelectLevel?: (level: string) => void;
  genres?: string[];
  selectedGenre?: string;
  onSelectGenre?: (genre: string) => void;
  reserveTopNavSpace?: boolean;
  catalogSpotlightOpen?: boolean;
  onOpenCatalogSpotlight?: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function CatalogSidebar({
  // welcomeName,
  // englishLevel,
  // avatarUrl,
  selectedLevel = "All",
  onSelectLevel,
  genres = [],
  selectedGenre = "All",
  onSelectGenre,
  reserveTopNavSpace = true,
  catalogSpotlightOpen = false,
  onOpenCatalogSpotlight,
  collapsed,
  onCollapsedChange,
}: CatalogSidebarProps) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const shell = useAppMessages().catalogShell;
  const common = useAppMessages().common;

  const sidebarLabels: Record<SidebarLinkId, string> = {
    catalog: shell.navCatalog,
    search: shell.navSearch,
    classroom: shell.navClassroom,
    myLessons: shell.navMyLessons,
    customise: shell.navCustomise,
    leaderboard: shell.navLeaderboard,
    profile: shell.navProfile,
  };

  const welcomeName = user?.name;
  const avatarUrl = user?.avatarUrl;
  const englishLevel = user?.englishLevel;

  const sortedGenres = ["All", ...genres.filter(Boolean).sort()];

  const linkActive = (linkId: SidebarLinkId) => {
    if (linkId === "catalog") {
      return pathname === "/catalog" && !catalogSpotlightOpen;
    }
    if (linkId === "search") {
      return pathname === "/catalog" && catalogSpotlightOpen;
    }
    const tab = searchParams.get("tab");
    if (linkId === "leaderboard") {
      return pathname === "/leaderboard";
    }
    if (linkId === "profile") {
      return pathname === "/profile" && tab !== "settings";
    }
    if (linkId === "customise") {
      return pathname === "/customise";
    }
    const link = sidebarLinkDefs.find((l) => l.id === linkId);
    return link ? pathname === link.to.split("?")[0] : false;
  };

  const filterLabel = (value: string): string => {
    if (value === "All") return common.filterAll;
    return value;
  };

  const sidebarTopClass = resolve_sidebar_top_class(reserveTopNavSpace);
  const visibleSidebarLinks = resolveVisibleSidebarLinks(user);

  return (
    <>
      <aside
        className={cn(
          "fixed bottom-0 left-0 z-50 hidden flex-col border-r border-border bg-card font-display transition-all duration-600 lg:flex",
          sidebarTopClass,
          collapsed ? "w-20" : "w-64 shadow-2xl",
        )}
      >
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="z-50 absolute top-6 hover:cursor-pointer -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
          aria-label={collapsed ? common.expandSidebar : common.collapseSidebar}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        <div
          className={cn(
            "mx-3 my-3 flex shrink-0 flex-col overflow-hidden rounded-[24px] border border-border transition-all",
            collapsed ? "p-1 items-center" : "pb-2",
          )}
        >
          {/* Верхняя часть: Аватарка и Имя */}
          <div className={cn("flex items-center gap-3", !collapsed && "p-1")}>
            <Link to="/profileMain" className="shrink-0">
              <img
                src={avatarUrl || "/LandingProfile.svg"}
                className={cn(
                  "hover:cursor-pointer rounded-full object-cover",
                  collapsed ? "m-2 h-8 w-8" : "ml-2 mt-2 mb-1 h-9 w-9",
                )}
                alt=""
              />
            </Link>

            {!collapsed && (
              <div className="min-w-0 flex-1 pr-3 pt-1">
                <p className="truncate text-[13px] text-foreground/70">
                  {welcomeName?.trim()
                    ? formatMessage(shell.greetingHi, { name: welcomeName })
                    : shell.welcomeBackExclaim}
                </p>
                <p className="text-sm font-semibold text-accent">
                  {englishLevel?.trim()
                    ? formatMessage(shell.levelWithDot, {
                        prefix: common.levelPrefix,
                        level: englishLevel,
                      })
                    : shell.brandsFallback}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="mt-1 flex flex-col gap-2">
              <div className="mx-3 h-px bg-border/60" />
              <div className="flex items-center justify-between px-4 pb-1">
                <span className="text-[12px] text-muted-foreground tracking-wider">
                  {shell.appTheme}
                </span>
                <div className="scale-90 origin-right">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex-col space-y-1 p-4">
            {visibleSidebarLinks.map((link) => {
              if (link.id === "search") {
                const active = linkActive(link.id);
                const itemClass = cn(
                  "flex w-full hover:cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2",
                );
                return pathname === "/catalog" && onOpenCatalogSpotlight ? (
                  <button
                    key={link.id}
                    type="button"
                    className={itemClass}
                    onClick={() => onOpenCatalogSpotlight()}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{sidebarLabels[link.id]}</span>}
                  </button>
                ) : (
                  <Link
                    key={link.id}
                    to="/catalog"
                    state={{ openSpotlight: true }}
                    className={itemClass}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{sidebarLabels[link.id]}</span>}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.id}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    linkActive(link.id)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{sidebarLabels[link.id]}</span>}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="space-y-4 border-t border-border p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                {shell.sectionLevel}
              </p>
              <div className="flex flex-wrap gap-1">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onSelectLevel?.(level)}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium transition-colors hover:cursor-pointer",
                      selectedLevel === level
                        ? "bg-primary text-primary-foreground shadow-inner"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filterLabel(level)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!collapsed && genres.length > 0 && (
            <div className="space-y-4 border-t border-border p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                {shell.sectionGenre}
              </p>
              <div className="flex flex-wrap gap-1">
                {sortedGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => onSelectGenre?.(genre)}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium transition-colors hover:cursor-pointer",
                      selectedGenre === genre
                        ? "bg-accent text-accent-foreground shadow-inner"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filterLabel(genre)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto border-t border-border p-4 shrink-0 bg-card">
          <Link
            to="/profile?tab=settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              pathname === "/profile" && searchParams.get("tab") === "settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{shell.settings}</span>}
          </Link>
        </div>
      </aside>

      {!collapsed && (
        <div
          className={cn(
            "fixed right-0 bottom-0 left-0 z-40 hidden bg-black/40 backdrop-blur-[3px] lg:block",
            sidebarTopClass,
          )}
          onClick={() => onCollapsedChange(true)}
        />
      )}

      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-around py-2">
          {visibleSidebarLinks.slice(0, 5).map((link) => {
            if (link.id === "search") {
              const active = linkActive(link.id);
              const itemClass = cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              );
              return pathname === "/catalog" && onOpenCatalogSpotlight ? (
                <button
                  key={link.id}
                  type="button"
                  className={itemClass}
                  onClick={() => onOpenCatalogSpotlight()}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs">{sidebarLabels[link.id]}</span>
                </button>
              ) : (
                <Link
                  key={link.id}
                  to="/catalog"
                  state={{ openSpotlight: true }}
                  className={itemClass}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs">{sidebarLabels[link.id]}</span>
                </Link>
              );
            }
            return (
              <Link
                key={link.id}
                to={link.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                  linkActive(link.id)
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-xs">{sidebarLabels[link.id]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <LearnerCustomiseFab />
    </>
  );
}
