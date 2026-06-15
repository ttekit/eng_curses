"use client"

import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Settings, Flame, Clock, Trophy, Target, Award, Lock, ChevronRight } from "lucide-react"

interface ProfileScreenProps {
  onTakeTest: () => void
}

const stats = [
  { label: "Day streak", value: "7", icon: Flame, color: "text-chart-3" },
  { label: "Hours", value: "24", icon: Clock, color: "text-chart-2" },
  { label: "Videos", value: "38", icon: Trophy, color: "text-primary" },
]

const skills = [
  { name: "Listening", value: 78 },
  { name: "Vocabulary", value: 64 },
  { name: "Grammar", value: 52 },
  { name: "Speaking", value: 41 },
]

const achievements = [
  { icon: Flame, label: "Week Streak", unlocked: true },
  { icon: Trophy, label: "First Test", unlocked: true },
  { icon: Award, label: "50 Words", unlocked: true },
  { icon: Target, label: "Perfect Quiz", unlocked: false },
  { icon: Award, label: "Level Up", unlocked: false },
  { icon: Trophy, label: "30 Videos", unlocked: false },
]

export function ProfileScreen({ onTakeTest }: ProfileScreenProps) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3">
        <h2 className="font-display text-xl font-bold text-foreground">Profile</h2>
        <button aria-label="Settings" className="text-muted-foreground">
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Identity card */}
      <div className="px-5">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border p-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-lg" aria-hidden />
            <ChameleonMascot size="md" mood="happy" animate={false} className="!w-16 !h-16" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-foreground leading-tight">Alex Johnson</h3>
            <p className="text-xs text-muted-foreground">Adult learner · Joined Mar 2026</p>
            <span className="mt-1.5 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
              Level B1 · Intermediate
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5 mt-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl bg-card border border-border p-3 text-center">
              <Icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold text-foreground leading-none">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Level progress */}
      <div className="px-5 mt-5">
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Progress to B2</span>
            <span className="text-xs font-bold text-primary">68%</span>
          </div>
          <Progress value={68} className="h-2" />
          <p className="text-[11px] text-muted-foreground mt-2">12 more videos to reach the next level</p>
        </div>
      </div>

      {/* Skills */}
      <section className="px-5 mt-5">
        <h4 className="text-sm font-semibold text-foreground mb-3">Skill breakdown</h4>
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.name}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-foreground">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{skill.value}%</span>
              </div>
              <Progress value={skill.value} className="h-1.5" />
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Achievements</h4>
          <button className="flex items-center text-xs text-primary font-medium">
            See all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((a) => {
            const Icon = a.icon
            return (
              <div
                key={a.label}
                className={`rounded-xl border p-3 text-center ${
                  a.unlocked ? "bg-primary/10 border-primary/30" : "bg-secondary/50 border-border"
                }`}
              >
                <div
                  className={`mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full ${
                    a.unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {a.unlocked ? <Icon className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
                </div>
                <p className="text-[10px] font-medium text-foreground leading-tight">{a.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Re-take test */}
      <div className="px-5 mt-6">
        <Button onClick={onTakeTest} variant="outline" className="w-full h-11 bg-transparent">
          <Target className="h-4 w-4" />
          Re-take level test
        </Button>
      </div>

      <div className="h-4" />
    </div>
  )
}
