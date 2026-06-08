import { Link, useLocation, useSearchParams } from "react-router";
import { cn } from "../../lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Search,
  Settings,
  Trophy,
  User,
  GraduationCap,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";

const sidebarLinkDefs = [
  { id: "catalog" as const, icon: LayoutGrid, to: "/catalog" },
  { id: "search" as const, icon: Search, to: "/catalog" },
  { id: "classroom" as const, icon: GraduationCap, to: "/classroom" },
  { id: "myLessons" as const, icon: BookOpen, to: "/watched-lessons" },
  { id: "profile" as const, icon: User, to: "/profile" },
  { id: "progress" as const, icon: Trophy, to: "/profile?tab=progress" },
] as const;

type SidebarLinkId = (typeof sidebarLinkDefs)[number]["id"];

const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

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
    progress: shell.navProgress,
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
    if (linkId === "progress") {
      return pathname === "/profile" && tab === "progress";
    }
    if (linkId === "profile") {
      return (
        pathname === "/profile" && tab !== "progress" && tab !== "settings"
      );
    }
    const link = sidebarLinkDefs.find((l) => l.id === linkId);
    return link ? pathname === link.to.split("?")[0] : false;
  };

  return (
    <>
      <aside
        className={cn(
          "fixed bottom-0 left-0 z-50 hidden flex-col border-r border-border bg-card font-display transition-all duration-600 lg:flex",
          reserveTopNavSpace ? "top-18" : "top-0",
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
            "mx-3 my-3 flex shrink-0 items-center gap-3 rounded-3xl border border-border p-1",
            collapsed && "justify-center",
          )}
        >
          <Link to="/profileMain">
            <img
              src={avatarUrl || "/LandingProfile.svg"}
              className="w-8 h-8 m-2 hover:cursor-pointer shrink-0 rounded-full object-cover"
            />
          </Link>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-foreground/70">
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

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex-col space-y-1 p-4">
            {sidebarLinkDefs.map((link) => {
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
                    {level}
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
                    {genre}
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
            reserveTopNavSpace ? "top-18" : "top-0",
          )}
          onClick={() => onCollapsedChange(true)}
        />
      )}

      <nav className="fixed right-0 bottom-0 left-0 z-40 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-around py-2">
          {sidebarLinkDefs.slice(0, 5).map((link) => {
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
    </>
  );
}
