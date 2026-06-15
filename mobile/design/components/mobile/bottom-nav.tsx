"use client"

import { Home, Search, User, Play, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MobileScreen } from "@/app/mobile/page"

interface BottomNavProps {
  active: MobileScreen
  onNavigate: (screen: MobileScreen) => void
  onResume: () => void
}

const leftItems = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "search" as const, label: "Search", icon: Search },
]

const rightItems = [
  { id: "explore" as const, label: "Explore", icon: Compass },
  { id: "profile" as const, label: "Profile", icon: User },
]

export function BottomNav({ active, onNavigate, onResume }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 inset-x-0 z-20">
      {/* Floating action button */}
      <button
        onClick={onResume}
        aria-label="Resume learning"
        className="absolute left-1/2 -translate-x-1/2 -top-7 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center border-4 border-background transition-transform active:scale-90 animate-glow"
      >
        <Play className="h-6 w-6 fill-current" />
      </button>

      <nav className="relative bg-card/95 backdrop-blur border-t border-border h-16 flex items-center justify-between px-4">
        <div className="flex flex-1 justify-around">
          {leftItems.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={active === item.id}
              onClick={() => onNavigate(item.id)}
            />
          ))}
        </div>

        {/* Spacer for FAB */}
        <div className="w-14" aria-hidden />

        <div className="flex flex-1 justify-around">
          {rightItems.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={active === (item.id as MobileScreen)}
              onClick={() => onNavigate(item.id === "explore" ? "home" : (item.id as MobileScreen))}
            />
          ))}
        </div>
      </nav>
    </div>
  )
}

function NavButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: typeof Home
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 px-2 py-1 transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "fill-primary/15")} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}
