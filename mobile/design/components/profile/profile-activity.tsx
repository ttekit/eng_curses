"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  PlayCircle, 
  CheckCircle, 
  Trophy, 
  Flame, 
  BookOpen,
  Star,
  TrendingUp
} from "lucide-react"

const activityHistory = [
  {
    id: "1",
    type: "video_completed",
    title: "Completed: The Office - Business Meeting",
    description: "Scored 85% on the quiz",
    timestamp: "2 hours ago",
    icon: CheckCircle,
    color: "text-accent",
  },
  {
    id: "2",
    type: "achievement",
    title: "Achievement Unlocked: Perfect Score",
    description: "Got 100% on TED Talk quiz",
    timestamp: "5 hours ago",
    icon: Trophy,
    color: "text-primary",
  },
  {
    id: "3",
    type: "streak",
    title: "Streak Extended!",
    description: "You are now on a 12-day streak",
    timestamp: "Today",
    icon: Flame,
    color: "text-orange-500",
  },
  {
    id: "4",
    type: "video_started",
    title: "Started: Friends - The One with the Interview",
    description: "Category: Casual Conversation",
    timestamp: "Yesterday",
    icon: PlayCircle,
    color: "text-primary",
  },
  {
    id: "5",
    type: "vocabulary",
    title: "New Words Learned",
    description: "Added 15 words to your vocabulary",
    timestamp: "Yesterday",
    icon: BookOpen,
    color: "text-chart-3",
  },
  {
    id: "6",
    type: "video_completed",
    title: "Completed: TED Talk - The Power of Vulnerability",
    description: "Scored 92% on the quiz",
    timestamp: "2 days ago",
    icon: CheckCircle,
    color: "text-accent",
  },
  {
    id: "7",
    type: "level_up",
    title: "Level Up!",
    description: "Advanced from A2 to B1",
    timestamp: "3 days ago",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    id: "8",
    type: "video_completed",
    title: "Completed: Breaking Bad - Chemistry Lesson",
    description: "Scored 78% on the quiz",
    timestamp: "4 days ago",
    icon: CheckCircle,
    color: "text-accent",
  },
  {
    id: "9",
    type: "achievement",
    title: "Achievement Unlocked: Word Collector",
    description: "Learned 100 new words",
    timestamp: "5 days ago",
    icon: Trophy,
    color: "text-primary",
  },
  {
    id: "10",
    type: "video_started",
    title: "Started: The Crown - Royal Speech",
    description: "Category: Drama",
    timestamp: "1 week ago",
    icon: PlayCircle,
    color: "text-primary",
  },
]

const streakCalendar = [
  { date: "Mon", active: true },
  { date: "Tue", active: true },
  { date: "Wed", active: true },
  { date: "Thu", active: false },
  { date: "Fri", active: true },
  { date: "Sat", active: true },
  { date: "Sun", active: true },
]

export function ProfileActivity() {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Activity timeline */}
      <div className="lg:col-span-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-6">
                  {activityHistory.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="relative flex gap-4 pl-10">
                        {/* Timeline dot */}
                        <div className={`absolute left-2 w-5 h-5 rounded-full bg-card border-2 border-border flex items-center justify-center`}>
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === "achievement" || activity.type === "level_up"
                              ? "bg-primary"
                              : activity.type === "streak"
                                ? "bg-orange-500"
                                : "bg-accent"
                          }`} />
                        </div>
                        
                        <div className="flex-1 bg-secondary/30 rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-background/50`}>
                              <Icon className={`w-4 h-4 ${activity.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Sidebar stats */}
      <div className="space-y-6">
        {/* Weekly streak */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Weekly Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-1">
              {streakCalendar.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    day.active 
                      ? "bg-orange-500 text-white" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {day.active && <Flame className="w-4 h-4" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              6 out of 7 days this week
            </p>
          </CardContent>
        </Card>
        
        {/* Quick stats */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Videos Watched</span>
              </div>
              <span className="font-semibold text-foreground">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Quizzes Passed</span>
              </div>
              <span className="font-semibold text-foreground">6</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-chart-3" />
                <span className="text-sm text-muted-foreground">Words Learned</span>
              </div>
              <span className="font-semibold text-foreground">42</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-chart-5" />
                <span className="text-sm text-muted-foreground">Average Score</span>
              </div>
              <span className="font-semibold text-foreground">85%</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Best performance */}
        <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Performance</p>
                <p className="font-semibold text-foreground">TED Talk: Vulnerability</p>
                <Badge className="mt-1 bg-accent/20 text-accent border-0">
                  92% Score
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
