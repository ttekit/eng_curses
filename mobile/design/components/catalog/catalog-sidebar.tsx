"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { 
  Home, 
  Search, 
  BookOpen, 
  Trophy, 
  User,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const sidebarLinks = [
  { icon: Home, label: "Home", href: "/catalog" },
  { icon: Search, label: "Search", href: "/catalog/search" },
  { icon: BookOpen, label: "My Lessons", href: "/catalog/lessons" },
  { icon: Trophy, label: "Progress", href: "/catalog/progress" },
  { icon: User, label: "Profile", href: "/catalog/profile" },
]

const levels = ["All", "A1", "A2", "B1", "B2", "C1", "C2"]
const categories = [
  "All",
  "Business",
  "Travel", 
  "Entertainment",
  "Academic",
  "Daily Life"
]

export function CatalogSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-card border-r border-border z-40 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 p-4 border-b border-border",
          collapsed && "justify-center"
        )}>
          <ChameleonMascot size="sm" mood="happy" animate={false} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">Welcome back!</p>
              <p className="text-sm text-muted-foreground">Level B1</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed && "justify-center px-2"
              )}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Filters - Only shown when expanded */}
        {!collapsed && (
          <div className="p-4 border-t border-border space-y-4">
            {/* Level Filter */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Level</p>
              <div className="flex flex-wrap gap-1">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                      selectedLevel === level
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Category</p>
              <div className="flex flex-wrap gap-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                      selectedCategory === category
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="p-4 border-t border-border">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          {sidebarLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
