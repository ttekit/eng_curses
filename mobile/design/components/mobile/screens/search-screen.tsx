"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, TrendingUp, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchScreenProps {
  onOpenVideo: (id: string) => void
}

const categories = ["All", "Business", "Travel", "Movies", "Daily Life", "Grammar", "News"]

const trending = ["Job interviews", "Past tense", "Ordering food", "Phrasal verbs", "Small talk"]

const results = [
  { id: "s1", title: "Small Talk at Work", level: "B1", cat: "Business", color: "from-chart-1/80 to-chart-1/30" },
  { id: "s2", title: "Airport Check-in", level: "A2", cat: "Travel", color: "from-chart-2/80 to-chart-2/30" },
  { id: "s3", title: "Movie Night Idioms", level: "B2", cat: "Movies", color: "from-chart-4/80 to-chart-4/30" },
  { id: "s4", title: "Morning Routine", level: "A1", cat: "Daily Life", color: "from-chart-5/80 to-chart-5/30" },
  { id: "s5", title: "Present Perfect", level: "B1", cat: "Grammar", color: "from-chart-3/80 to-chart-3/30" },
  { id: "s6", title: "World Headlines", level: "C1", cat: "News", color: "from-chart-1/80 to-chart-1/30" },
]

export function SearchScreen({ onOpenVideo }: SearchScreenProps) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState("All")

  const filtered = results.filter((r) => {
    const matchesCat = active === "All" || r.cat === active
    const matchesQuery = !query || r.title.toLowerCase().includes(query.toLowerCase())
    return matchesCat && matchesQuery
  })

  return (
    <div className="flex flex-col px-5">
      <header className="pt-3 pb-2">
        <h2 className="font-display text-xl font-bold text-foreground mb-3">Search</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos, topics, words..."
            className="pl-9 pr-9 h-11 bg-input border-border rounded-xl"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 -mx-5 px-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              active === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending (only when no query) */}
      {!query && (
        <section className="mt-3 mb-4">
          <div className="flex items-center gap-1.5 mb-2 text-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Trending searches</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map((t) => (
              <button key={t} onClick={() => setQuery(t)}>
                <Badge variant="secondary" className="cursor-pointer font-normal">
                  {t}
                </Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Results grid */}
      <section className="mt-2">
        <p className="text-xs text-muted-foreground mb-2">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
            <button key={item.id} onClick={() => onOpenVideo(item.id)} className="text-left">
              <div className={`relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br ${item.color}`}>
                <span className="absolute top-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-bold text-foreground">
                  {item.level}
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background/85">
                    <Play className="h-3.5 w-3.5 fill-foreground text-foreground" />
                  </span>
                </span>
              </div>
              <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-1">{item.title}</p>
              <p className="text-[11px] text-muted-foreground">{item.cat}</p>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No videos match your search.</p>
        )}
      </section>

      <div className="h-4" />
    </div>
  )
}
