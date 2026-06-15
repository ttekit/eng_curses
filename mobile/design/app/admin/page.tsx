"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import {
  Users,
  Video,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  BookOpen,
  GraduationCap,
  Eye,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const stats = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Videos",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: Video,
  },
  {
    title: "Watch Hours",
    value: "45,678",
    change: "+23.1%",
    trend: "up",
    icon: Clock,
  },
  {
    title: "Completion Rate",
    value: "67.8%",
    change: "-2.3%",
    trend: "down",
    icon: TrendingUp,
  },
]

const userGrowthData = [
  { month: "Jan", users: 4000 },
  { month: "Feb", users: 5200 },
  { month: "Mar", users: 6100 },
  { month: "Apr", users: 7800 },
  { month: "May", users: 9200 },
  { month: "Jun", users: 10500 },
  { month: "Jul", users: 12847 },
]

const levelDistribution = [
  { level: "A1", count: 2100 },
  { level: "A2", count: 3200 },
  { level: "B1", count: 3800 },
  { level: "B2", count: 2400 },
  { level: "C1", count: 1100 },
  { level: "C2", count: 247 },
]

const recentActivities = [
  {
    user: "Sarah M.",
    action: "completed",
    item: "Business Email Writing",
    time: "2 minutes ago",
    type: "video",
  },
  {
    user: "John D.",
    action: "registered as",
    item: "Teacher",
    time: "5 minutes ago",
    type: "user",
  },
  {
    user: "Emily R.",
    action: "passed",
    item: "B2 Level Test",
    time: "12 minutes ago",
    type: "test",
  },
  {
    user: "Michael K.",
    action: "started watching",
    item: "Travel Conversations",
    time: "18 minutes ago",
    type: "video",
  },
  {
    user: "Lisa T.",
    action: "added topic",
    item: "Advanced Grammar",
    time: "25 minutes ago",
    type: "topic",
  },
]

const popularVideos = [
  {
    title: "Business Meeting Vocabulary",
    views: 12453,
    completionRate: 78,
    level: "B1",
  },
  {
    title: "Daily Conversations at Work",
    views: 10234,
    completionRate: 82,
    level: "A2",
  },
  {
    title: "Travel English Essentials",
    views: 9876,
    completionRate: 71,
    level: "A2",
  },
  {
    title: "Advanced Idioms & Phrases",
    views: 8765,
    completionRate: 65,
    level: "C1",
  },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with Exply.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline">Export Report</Button>
          <Button className="bg-primary hover:bg-primary/90">
            Add New Video
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-accent" : "text-destructive"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.65 0.25 295)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.65 0.25 295)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="oklch(0.7 0.02 285)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.7 0.02 285)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.03 285)",
                      border: "1px solid oklch(0.28 0.04 285)",
                      borderRadius: "8px",
                      color: "oklch(0.98 0 0)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="oklch(0.65 0.25 295)"
                    strokeWidth={2}
                    fill="url(#userGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Users by English Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelDistribution}>
                  <XAxis
                    dataKey="level"
                    stroke="oklch(0.7 0.02 285)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.7 0.02 285)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.18 0.03 285)",
                      border: "1px solid oklch(0.28 0.04 285)",
                      borderRadius: "8px",
                      color: "oklch(0.98 0 0)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="oklch(0.65 0.25 295)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {activity.type === "video" && (
                      <Play className="w-5 h-5 text-primary" />
                    )}
                    {activity.type === "user" && (
                      <Users className="w-5 h-5 text-primary" />
                    )}
                    {activity.type === "test" && (
                      <GraduationCap className="w-5 h-5 text-primary" />
                    )}
                    {activity.type === "topic" && (
                      <BookOpen className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">
                        {activity.action}
                      </span>{" "}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Videos */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Popular Videos</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularVideos.map((video, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {video.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={video.completionRate} className="h-1.5" />
                    <span className="text-xs text-muted-foreground shrink-0">
                      {video.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mascot Tip */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <ChameleonMascot size="md" mood="thinking" />
            <div>
              <h3 className="font-semibold text-foreground">Pro Tip</h3>
              <p className="text-sm text-muted-foreground">
                Based on recent data, videos under 10 minutes have 23% higher
                completion rates. Consider breaking longer content into smaller
                segments!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
