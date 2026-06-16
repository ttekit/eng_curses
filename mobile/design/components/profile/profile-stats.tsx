"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, PlayCircle, CheckCircle, Target, TrendingUp, Award } from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"

interface ProfileStatsProps {
  user: {
    totalWatchTime: number
    videosCompleted: number
    testsCompleted: number
    averageScore: number
    level: string
  }
}

const weeklyActivity = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 30 },
  { day: "Wed", minutes: 60 },
  { day: "Thu", minutes: 25 },
  { day: "Fri", minutes: 55 },
  { day: "Sat", minutes: 90 },
  { day: "Sun", minutes: 40 },
]

const skillBreakdown = [
  { skill: "Listening", value: 78, color: "hsl(var(--primary))" },
  { skill: "Vocabulary", value: 65, color: "hsl(var(--accent))" },
  { skill: "Grammar", value: 72, color: "hsl(var(--chart-3))" },
  { skill: "Speaking", value: 58, color: "hsl(var(--chart-4))" },
]

const levelProgress = [
  { level: "A1", completed: 100 },
  { level: "A2", completed: 100 },
  { level: "B1", completed: 45 },
  { level: "B2", completed: 0 },
  { level: "C1", completed: 0 },
  { level: "C2", completed: 0 },
]

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ProfileStats({ user }: ProfileStatsProps) {
  const hours = Math.floor(user.totalWatchTime / 60)
  const minutes = user.totalWatchTime % 60

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{hours}h {minutes}m</p>
                <p className="text-xs text-muted-foreground">Total Watch Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <PlayCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{user.videosCompleted}</p>
                <p className="text-xs text-muted-foreground">Videos Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/20">
                <CheckCircle className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{user.testsCompleted}</p>
                <p className="text-xs text-muted-foreground">Tests Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-4/20">
                <Target className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{user.averageScore}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly activity */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMinutes)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Skill breakdown */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Skill Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillBreakdown.map((skill) => (
                <div key={skill.skill} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{skill.skill}</span>
                    <span className="text-muted-foreground">{skill.value}%</span>
                  </div>
                  <Progress 
                    value={skill.value} 
                    className="h-2"
                    style={{ 
                      // @ts-expect-error CSS custom property
                      "--progress-foreground": skill.color 
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Level progression */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Level Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {levelProgress.map((lp, index) => (
              <div key={lp.level} className="flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-full h-3 rounded-full ${
                      lp.completed === 100 
                        ? "bg-accent" 
                        : lp.completed > 0 
                          ? "bg-gradient-to-r from-accent to-primary/30"
                          : "bg-secondary"
                    }`}
                    style={lp.completed > 0 && lp.completed < 100 ? {
                      background: `linear-gradient(to right, hsl(var(--accent)) ${lp.completed}%, hsl(var(--secondary)) ${lp.completed}%)`
                    } : undefined}
                  />
                  <span className={`text-xs font-medium ${
                    user.level === lp.level ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {lp.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            You are currently at <span className="text-primary font-semibold">{user.level}</span> level - keep it up!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
