"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Video,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Target,
  BookOpen,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

const engagementData = [
  { date: "Mon", activeUsers: 4200, videoStarts: 3100, testsTaken: 890 },
  { date: "Tue", activeUsers: 4800, videoStarts: 3600, testsTaken: 1020 },
  { date: "Wed", activeUsers: 5100, videoStarts: 3900, testsTaken: 1150 },
  { date: "Thu", activeUsers: 4600, videoStarts: 3400, testsTaken: 980 },
  { date: "Fri", activeUsers: 5400, videoStarts: 4200, testsTaken: 1280 },
  { date: "Sat", activeUsers: 6200, videoStarts: 4800, testsTaken: 1420 },
  { date: "Sun", activeUsers: 5800, videoStarts: 4500, testsTaken: 1350 },
]

const retentionData = [
  { week: "Week 1", retention: 100 },
  { week: "Week 2", retention: 72 },
  { week: "Week 3", retention: 58 },
  { week: "Week 4", retention: 48 },
  { week: "Week 5", retention: 42 },
  { week: "Week 6", retention: 38 },
  { week: "Week 7", retention: 35 },
  { week: "Week 8", retention: 33 },
]

const levelProgressData = [
  { name: "A1 → A2", value: 320, color: "oklch(0.65 0.25 295)" },
  { name: "A2 → B1", value: 280, color: "oklch(0.75 0.18 145)" },
  { name: "B1 → B2", value: 190, color: "oklch(0.7 0.2 30)" },
  { name: "B2 → C1", value: 95, color: "oklch(0.75 0.15 200)" },
  { name: "C1 → C2", value: 35, color: "oklch(0.8 0.12 60)" },
]

const categoryPerformance = [
  { category: "Business", avgCompletion: 78, avgScore: 82, videos: 245 },
  { category: "Travel", avgCompletion: 85, avgScore: 79, videos: 189 },
  { category: "Daily Life", avgCompletion: 89, avgScore: 85, videos: 312 },
  { category: "Academic", avgCompletion: 65, avgScore: 71, videos: 156 },
  { category: "Entertainment", avgCompletion: 91, avgScore: 88, videos: 234 },
]

const topPerformingVideos = [
  { title: "Business Meeting Vocabulary", views: 12453, completion: 78, score: 84 },
  { title: "Daily Conversations at Work", views: 10234, completion: 82, score: 87 },
  { title: "Travel English Essentials", views: 9876, completion: 71, score: 79 },
  { title: "Advanced Idioms & Phrases", views: 8765, completion: 65, score: 73 },
  { title: "Restaurant Ordering Made Easy", views: 7654, completion: 89, score: 91 },
]

const metrics = [
  {
    title: "Daily Active Users",
    value: "5,847",
    change: "+14.2%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Avg. Watch Time",
    value: "24 min",
    change: "+8.5%",
    trend: "up",
    icon: Clock,
  },
  {
    title: "Completion Rate",
    value: "67.8%",
    change: "-2.3%",
    trend: "down",
    icon: Target,
  },
  {
    title: "Avg. Test Score",
    value: "78.5%",
    change: "+3.1%",
    trend: "up",
    icon: BookOpen,
  },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === "up" ? "text-accent" : "text-destructive"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="progress">Level Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Daily Engagement Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="activeUsersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.65 0.25 295)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(0.65 0.25 295)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="videoStartsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.75 0.18 145)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(0.75 0.18 145)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
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
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active Users"
                      stroke="oklch(0.65 0.25 295)"
                      strokeWidth={2}
                      fill="url(#activeUsersGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="videoStarts"
                      name="Video Starts"
                      stroke="oklch(0.75 0.18 145)"
                      strokeWidth={2}
                      fill="url(#videoStartsGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="testsTaken"
                      name="Tests Taken"
                      stroke="oklch(0.7 0.2 30)"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                User Retention Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={retentionData}>
                    <XAxis
                      dataKey="week"
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
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.18 0.03 285)",
                        border: "1px solid oklch(0.28 0.04 285)",
                        borderRadius: "8px",
                        color: "oklch(0.98 0 0)",
                      }}
                      formatter={(value) => [`${value}%`, "Retention"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="retention"
                      stroke="oklch(0.65 0.25 295)"
                      strokeWidth={3}
                      dot={{ fill: "oklch(0.65 0.25 295)", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "oklch(0.65 0.25 295)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Level Progression (This Month)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={levelProgressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {levelProgressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.18 0.03 285)",
                          border: "1px solid oklch(0.28 0.04 285)",
                          borderRadius: "8px",
                          color: "oklch(0.98 0 0)",
                        }}
                        formatter={(value) => [`${value} users`, "Progressed"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {levelProgressData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryPerformance} layout="vertical">
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        stroke="oklch(0.7 0.02 285)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        stroke="oklch(0.7 0.02 285)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.18 0.03 285)",
                          border: "1px solid oklch(0.28 0.04 285)",
                          borderRadius: "8px",
                          color: "oklch(0.98 0 0)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="avgCompletion"
                        name="Avg Completion %"
                        fill="oklch(0.65 0.25 295)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="avgScore"
                        name="Avg Test Score %"
                        fill="oklch(0.75 0.18 145)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Top Performing Content */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            Top Performing Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingVideos.map((video, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {video.title}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {video.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {video.completion}% completion
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {video.score}% avg score
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
