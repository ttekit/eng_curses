"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { 
  Trophy, 
  Flame, 
  BookOpen, 
  Star, 
  Clock, 
  Target, 
  Zap,
  Award,
  Crown,
  Heart,
  Lock
} from "lucide-react"

const achievements = [
  {
    id: "first-video",
    title: "First Steps",
    description: "Complete your first video",
    icon: PlayCircleIcon,
    unlocked: true,
    date: "Jan 15, 2024",
    rarity: "common",
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: Flame,
    unlocked: true,
    date: "Jan 22, 2024",
    rarity: "common",
  },
  {
    id: "streak-30",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: Crown,
    unlocked: false,
    progress: 40,
    rarity: "rare",
  },
  {
    id: "vocabulary-100",
    title: "Word Collector",
    description: "Learn 100 new words",
    icon: BookOpen,
    unlocked: true,
    date: "Feb 5, 2024",
    rarity: "common",
  },
  {
    id: "vocabulary-500",
    title: "Lexicon Lord",
    description: "Learn 500 new words",
    icon: Star,
    unlocked: true,
    date: "Mar 10, 2024",
    rarity: "rare",
  },
  {
    id: "vocabulary-1000",
    title: "Dictionary Deity",
    description: "Learn 1000 new words",
    icon: Award,
    unlocked: false,
    progress: 85,
    rarity: "legendary",
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Get 100% on any quiz",
    icon: Target,
    unlocked: true,
    date: "Feb 20, 2024",
    rarity: "rare",
  },
  {
    id: "watch-10-hours",
    title: "Binge Watcher",
    description: "Watch 10 hours of content",
    icon: Clock,
    unlocked: true,
    date: "Feb 28, 2024",
    rarity: "common",
  },
  {
    id: "level-up",
    title: "Level Up",
    description: "Advance to the next level",
    icon: Zap,
    unlocked: true,
    date: "Mar 15, 2024",
    rarity: "rare",
  },
  {
    id: "all-categories",
    title: "Well Rounded",
    description: "Complete videos in all categories",
    icon: Heart,
    unlocked: false,
    progress: 60,
    rarity: "rare",
  },
  {
    id: "speed-learner",
    title: "Speed Learner",
    description: "Complete 5 videos in one day",
    icon: Zap,
    unlocked: false,
    progress: 0,
    rarity: "legendary",
  },
  {
    id: "top-student",
    title: "Top Student",
    description: "Reach the top 10% of learners",
    icon: Trophy,
    unlocked: false,
    progress: 75,
    rarity: "legendary",
  },
]

function PlayCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  )
}

const rarityColors = {
  common: "border-muted-foreground/30 bg-secondary/50",
  rare: "border-primary/50 bg-primary/10",
  legendary: "border-accent/50 bg-accent/10",
}

const rarityBadge = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-primary/20 text-primary",
  legendary: "bg-accent/20 text-accent",
}

export function ProfileAchievements() {
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  
  return (
    <div className="space-y-6">
      {/* Achievement summary */}
      <Card className="bg-gradient-to-br from-primary/20 via-card to-accent/20 border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ChameleonMascot size="lg" mood="excited" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Achievement Hunter
              </h2>
              <p className="text-muted-foreground mb-4">
                You&apos;ve unlocked {unlockedCount} out of {totalCount} achievements. Keep learning to unlock more!
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-foreground font-medium">
                    {Math.round((unlockedCount / totalCount) * 100)}%
                  </span>
                </div>
                <Progress value={(unlockedCount / totalCount) * 100} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Achievement grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          return (
            <Card 
              key={achievement.id}
              className={`relative overflow-hidden transition-all ${
                achievement.unlocked 
                  ? rarityColors[achievement.rarity as keyof typeof rarityColors]
                  : "bg-card/30 border-border/30 opacity-60"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    achievement.unlocked 
                      ? achievement.rarity === "legendary" 
                        ? "bg-accent/20" 
                        : achievement.rarity === "rare"
                          ? "bg-primary/20"
                          : "bg-secondary"
                      : "bg-secondary/50"
                  }`}>
                    {achievement.unlocked ? (
                      <Icon className={`w-6 h-6 ${
                        achievement.rarity === "legendary"
                          ? "text-accent"
                          : achievement.rarity === "rare"
                            ? "text-primary"
                            : "text-foreground"
                      }`} />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {achievement.title}
                      </h3>
                      <Badge className={`text-xs ${rarityBadge[achievement.rarity as keyof typeof rarityBadge]}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {achievement.unlocked ? (
                      <p className="text-xs text-accent">
                        Unlocked {achievement.date}
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <Progress value={achievement.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
