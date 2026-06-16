"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreVertical,
  FileQuestion,
  CheckCircle,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Copy,
  Eye,
  BarChart,
} from "lucide-react"

const tests = [
  {
    id: 1,
    title: "A1 Placement Test",
    type: "placement",
    level: "A1",
    questions: 20,
    duration: "15 min",
    attempts: 3456,
    avgScore: 72,
    passRate: 68,
    status: "active",
  },
  {
    id: 2,
    title: "A2 Placement Test",
    type: "placement",
    level: "A2",
    questions: 25,
    duration: "20 min",
    attempts: 2987,
    avgScore: 75,
    passRate: 71,
    status: "active",
  },
  {
    id: 3,
    title: "Business Meeting Quiz",
    type: "video",
    level: "B1",
    questions: 10,
    duration: "5 min",
    attempts: 1234,
    avgScore: 84,
    passRate: 89,
    status: "active",
  },
  {
    id: 4,
    title: "Travel English Quiz",
    type: "video",
    level: "A2",
    questions: 8,
    duration: "4 min",
    attempts: 987,
    avgScore: 79,
    passRate: 85,
    status: "active",
  },
  {
    id: 5,
    title: "B1 Level Assessment",
    type: "placement",
    level: "B1",
    questions: 30,
    duration: "25 min",
    attempts: 2145,
    avgScore: 68,
    passRate: 62,
    status: "active",
  },
  {
    id: 6,
    title: "Advanced Grammar Test",
    type: "practice",
    level: "C1",
    questions: 40,
    duration: "30 min",
    attempts: 654,
    avgScore: 65,
    passRate: 58,
    status: "draft",
  },
  {
    id: 7,
    title: "Daily Life Vocabulary",
    type: "video",
    level: "A1",
    questions: 8,
    duration: "4 min",
    attempts: 1876,
    avgScore: 88,
    passRate: 92,
    status: "active",
  },
]

const testTypeColors = {
  placement: "bg-blue-500/20 text-blue-400",
  video: "bg-primary/20 text-primary",
  practice: "bg-amber-500/20 text-amber-400",
}

export default function TestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || test.type === typeFilter
    const matchesLevel = levelFilter === "all" || test.level === levelFilter
    return matchesSearch && matchesType && matchesLevel
  })

  const stats = {
    total: tests.length,
    totalAttempts: tests.reduce((acc, t) => acc + t.attempts, 0),
    avgPassRate: Math.round(
      tests.reduce((acc, t) => acc + t.passRate, 0) / tests.length
    ),
    activeTests: tests.filter((t) => t.status === "active").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">
            Tests & Quizzes
          </h1>
          <p className="text-muted-foreground">
            Manage placement tests and video quizzes
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New Test
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Test Title
                </label>
                <Input placeholder="Enter test title" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Test Type
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placement">Placement Test</SelectItem>
                      <SelectItem value="video">Video Quiz</SelectItem>
                      <SelectItem value="practice">Practice Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Level
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="C1">C1</SelectItem>
                      <SelectItem value="C2">C2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Duration (minutes)
                  </label>
                  <Input type="number" placeholder="15" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Pass Score (%)
                  </label>
                  <Input type="number" placeholder="70" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Create Test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalAttempts.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.avgPassRate}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Pass Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.activeTests}
              </p>
              <p className="text-sm text-muted-foreground">Active Tests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted border-0"
              />
            </div>
            <div className="flex gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="placement">Placement</SelectItem>
                  <SelectItem value="video">Video Quiz</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Test</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Level</TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">
                    Questions
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">
                    Duration
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">
                    Attempts
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden lg:table-cell">
                    Avg Score
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Pass Rate
                  </TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow
                    key={test.id}
                    className="border-border hover:bg-muted/50"
                  >
                    <TableCell>
                      <p className="font-medium text-foreground">{test.title}</p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          testTypeColors[test.type as keyof typeof testTypeColors]
                        }`}
                      >
                        {test.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{test.level}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {test.questions}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {test.duration}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-foreground">
                      {test.attempts.toLocaleString()}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-foreground">
                      {test.avgScore}%
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          test.passRate >= 70
                            ? "text-accent"
                            : test.passRate >= 50
                            ? "text-amber-400"
                            : "text-destructive"
                        }`}
                      >
                        {test.passRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          test.status === "active" ? "default" : "secondary"
                        }
                        className={
                          test.status === "active"
                            ? "bg-accent/20 text-accent hover:bg-accent/30"
                            : ""
                        }
                      >
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart className="w-4 h-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTests.length} of {tests.length} tests
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
