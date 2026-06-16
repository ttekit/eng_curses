"use client"

import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell, Flame, Play } from "lucide-react"

interface HomeScreenProps {
  onOpenVideo: (id: string) => void
}

const rows = [
  {
    title: "Continue watching",
    items: [
      { id: "c1", title: "Coffee Shop Talk", level: "A2", progress: 60, color: "from-chart-1/80 to-chart-1/30" },
      { id: "c2", title: "Job Interview Tips", level: "B1", progress: 25, color: "from-chart-4/80 to-chart-4/30" },
    ],
  },
  {
    title: "Recommended for you",
    items: [
      { id: "r1", title: "Travel in London", level: "A2", color: "from-chart-2/80 to-chart-2/30" },
      { id: "r2", title: "Tech News Weekly", level: "B2", color: "from-chart-5/80 to-chart-5/30" },
      { id: "r3", title: "Cooking Idioms", level: "B1", color: "from-chart-3/80 to-chart-3/30" },
    ],
  },
  {
    title: "Beginner friendly",
    items: [
      { id: "b1", title: "Daily Greetings", level: "A1", color: "from-chart-2/80 to-chart-2/30" },
      { id: "b2", title: "Numbers & Time", level: "A1", color: "from-chart-1/80 to-chart-1/30" },
      { id: "b3", title: "At the Market", level: "A2", color: "from-chart-4/80 to-chart-4/30" },
    ],
  },
]

export function HomeScreen({ onOpenVideo }: HomeScreenProps) {
  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <ChameleonMascot size="sm" animate={false} className="!w-9 !h-9" />
          <div>
            <p className="text-xs text-muted-foreground leading-none">Welcome back</p>
            <p className="text-sm font-semibold text-foreground">Alex</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-chart-3/15 px-2.5 py-1 text-chart-3">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">7</span>
          </div>
          <button aria-label="Notifications" className="relative text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      {/* Featured hero */}
      <div className="px-5">
        <button
          onClick={() => onOpenVideo("featured")}
          className="relative w-full overflow-hidden rounded-2xl text-left"
        >
          <div className="aspect-video w-full bg-gradient-to-br from-primary via-primary/70 to-accent/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Badge className="mb-2 bg-primary text-primary-foreground border-0">Featured · B1</Badge>
            <h3 className="font-display text-lg font-bold text-foreground">A Day in New York City</h3>
            <p className="text-xs text-muted-foreground mb-3">12 min · Listening & Vocabulary</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background">
              <Play className="h-3.5 w-3.5 fill-current" />
              Play now
            </span>
          </div>
        </button>
      </div>

      {/* Rows */}
      <div className="mt-5 space-y-6">
        {rows.map((row) => (
          <section key={row.title}>
            <h4 className="px-5 mb-2 text-sm font-semibold text-foreground">{row.title}</h4>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
              {row.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onOpenVideo(item.id)}
                  className="shrink-0 w-36 text-left"
                >
                  <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br ${item.color}`}>
                    <span className="absolute top-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                      {item.level}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background/85">
                        <Play className="h-4 w-4 fill-foreground text-foreground" />
                      </span>
                    </span>
                    {"progress" in item && item.progress !== undefined && (
                      <span className="absolute bottom-0 inset-x-0">
                        <Progress value={item.progress} className="h-1 rounded-none" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-1">{item.title}</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="h-4" />
    </div>
  )
}
