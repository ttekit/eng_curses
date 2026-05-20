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
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutGrid, label: "Catalog", to: "/catalog" },
  { icon: Search, label: "Search", to: "/catalog" },
  { icon: BookOpen, label: "My Lessons", to: "/watched-lessons" },
  { icon: Trophy, label: "Progress", to: "/profile?tab=progress" },
  { icon: User, label: "Profile", to: "/profile" },
] as const;

const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

interface CatalogSidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  welcomeName?: string;
  englishLevel?: string;
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
  categories,
  selectedCategory,
  onSelectCategory,
  welcomeName,
  englishLevel,
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
  const sortedCategories = ["All", ...categories.filter(Boolean).sort()];
  const sortedGenres = ["All", ...genres.filter(Boolean).sort()];

  const linkActive = (link: (typeof sidebarLinks)[number]) => {
    if (link.label === "Catalog") {
      return pathname === "/catalog" && !catalogSpotlightOpen;
    }
    if (link.label === "Search") {
      return pathname === "/catalog" && catalogSpotlightOpen;
    }
    const tab = searchParams.get("tab");
    if (link.label === "Progress") {
      return pathname === "/profile" && tab === "progress";
    }
    if (link.label === "Profile") {
      return (
        pathname === "/profile" && tab !== "progress" && tab !== "settings"
      );
    }
    return pathname === link.to;
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
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
              src="/LandingProfile.svg"
              className="w-8 h-8 m-2 hover:cursor-pointer shrink-0"
            />
          </Link>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-foreground/70">
                {welcomeName?.trim() ? `Hi, ${welcomeName}` : "Welcome back!"}
              </p>
              <p className="text-sm font-semibold text-accent">
                {englishLevel?.trim() ? `• Level ${englishLevel}` : "Explys"}
              </p>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex-col space-y-1 p-4">
            {sidebarLinks.map((link) => {
              if (link.label === "Search") {
                const active = linkActive(link);
                const itemClass = cn(
                  "flex w-full hover:cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2",
                );
                return pathname === "/catalog" && onOpenCatalogSpotlight ? (
                  <button
                    key={link.label}
                    type="button"
                    className={itemClass}
                    onClick={() => onOpenCatalogSpotlight()}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{link.label}</span>}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to="/catalog"
                    state={{ openSpotlight: true }}
                    className={itemClass}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{link.label}</span>}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    linkActive(link)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="space-y-4 border-t border-border p-4">
              <p className="mb-2 text-sm font-medium text-foreground">Level</p>
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

          {!collapsed && (
            <div className="space-y-4 border-t border-border p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                Category
              </p>
              <div className="flex flex-wrap gap-1">
                {sortedCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onSelectCategory(category)}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium transition-colors hover:cursor-pointer",
                      selectedCategory === category
                        ? "bg-accent text-accent-foreground shadow-inner"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!collapsed && genres.length > 0 && (
            <div className="space-y-4 border-t border-border p-4">
              <p className="mb-2 text-sm font-medium text-foreground">Genre</p>
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
            {!collapsed && <span>Settings</span>}
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
          {sidebarLinks.slice(0, 5).map((link) => {
            if (link.label === "Search") {
              const active = linkActive(link);
              const itemClass = cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              );
              return pathname === "/catalog" && onOpenCatalogSpotlight ? (
                <button
                  key={link.label}
                  type="button"
                  className={itemClass}
                  onClick={() => onOpenCatalogSpotlight()}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs">{link.label}</span>
                </button>
              ) : (
                <Link
                  key={link.label}
                  to="/catalog"
                  state={{ openSpotlight: true }}
                  className={itemClass}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs">{link.label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                  linkActive(link) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-xs">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
