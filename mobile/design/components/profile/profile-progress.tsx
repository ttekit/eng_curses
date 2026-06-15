"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PlayCircle, CheckCircle, Lock, ChevronRight } from "lucide-react"
import Link from "next/link"

const learningPaths = [
  {
    id: "business",
    title: "Business English",
    description: "Professional communication for the workplace",
    progress: 65,
    totalVideos: 24,
    completedVideos: 16,
    level: "B2",
    color: "bg-primary",
  },
  {
    id: "travel",
    title: "Travel & Conversation",
    description: "Essential phrases for traveling abroad",
    progress: 40,
    totalVideos: 18,
    completedVideos: 7,
    level: "B1",
    color: "bg-accent",
  },
  {
    id: "academic",
    title: "Academic English",
    description: "Writing and presentation skills",
    progress: 20,
    totalVideos: 30,
    completedVideos: 6,
    level: "C1",
    color: "bg-chart-3",
  },
]

const recentVideos = [
  { id: "1", title: "The Office - Business Meeting", category: "Business", completed: true, score: 85 },
  { id: "2", title: "TED Talk: The Power of Vulnerability", category: "Motivation", completed: true, score: 92 },
  { id: "3", title: "Friends - The One with the Interview", category: "Casual", completed: false, progress: 80 },
  { id: "4", title: "Breaking Bad - Chemistry Lesson", category: "Drama", completed: false, progress: 0 },
]

const vocabularyProgress = {
  total: 1250,
  learned: 847,
  mastered: 523,
  reviewing: 324,
}

export function ProfileProgress() {
  return (
    <div className="space-y-6">
      {/* Learning paths */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Learning Paths</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {learningPaths.map((path) => (
            <div 
              key={path.id}
              className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{path.title}</h3>
                    <Badge variant="outline" className="text-xs">{path.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{path.description}</p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/catalog?path=${path.id}`}>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {path.completedVideos} / {path.totalVideos} videos
                  </span>
                  <span className="text-foreground font-medium">{path.progress}%</span>
                </div>
                <Progress value={path.progress} className={`h-2 ${path.color}`} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Recent videos */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Videos</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/catalog">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVideos.map((video) => (
              <div 
                key={video.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  video.completed 
                    ? "bg-accent/20" 
                    : video.progress > 0 
                      ? "bg-primary/20" 
                      : "bg-secondary"
                }`}>
                  {video.completed ? (
                    <CheckCircle className="w-5 h-5 text-accent" />
                  ) : video.progress > 0 ? (
                    <PlayCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{video.title}</p>
                  <p className="text-sm text-muted-foreground">{video.category}</p>
                </div>
                <div className="text-right">
                  {video.completed ? (
                    <Badge className="bg-accent/20 text-accent border-0">
                      Score: {video.score}%
                    </Badge>
                  ) : video.progress > 0 ? (
                    <span className="text-sm text-muted-foreground">{video.progress}%</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not started</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Vocabulary progress */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Vocabulary Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-secondary/30">
              <p className="text-3xl font-bold text-foreground">{vocabularyProgress.total}</p>
              <p className="text-sm text-muted-foreground">Total Words</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-primary/10">
              <p className="text-3xl font-bold text-primary">{vocabularyProgress.learned}</p>
              <p className="text-sm text-muted-foreground">Learned</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-accent/10">
              <p className="text-3xl font-bold text-accent">{vocabularyProgress.mastered}</p>
              <p className="text-sm text-muted-foreground">Mastered</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-chart-3/10">
              <p className="text-3xl font-bold text-chart-3">{vocabularyProgress.reviewing}</p>
              <p className="text-sm text-muted-foreground">Reviewing</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-foreground font-medium">
                {Math.round((vocabularyProgress.learned / vocabularyProgress.total) * 100)}%
              </span>
            </div>
            <div className="h-4 rounded-full bg-secondary overflow-hidden flex">
              <div 
                className="bg-accent h-full" 
                style={{ width: `${(vocabularyProgress.mastered / vocabularyProgress.total) * 100}%` }}
              />
              <div 
                className="bg-primary h-full" 
                style={{ width: `${((vocabularyProgress.learned - vocabularyProgress.mastered) / vocabularyProgress.total) * 100}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent" /> Mastered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary" /> Learning
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary" /> Remaining
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
