"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  GraduationCap,
  Users,
  Star,
  BookOpen,
  Edit,
  Trash2,
  Mail,
  CheckCircle,
} from "lucide-react"

const teachers = [
  {
    id: 1,
    name: "Dr. Emily Watson",
    email: "emily.w@exply.com",
    grades: ["Elementary", "Middle School"],
    topics: ["Grammar Basics", "Vocabulary Building", "Reading Comprehension"],
    students: 234,
    rating: 4.9,
    lessonsCreated: 45,
    status: "active",
    joinedDate: "2023-06-15",
  },
  {
    id: 2,
    name: "James Rodriguez",
    email: "james.r@exply.com",
    grades: ["High School", "Adults"],
    topics: ["Business English", "Formal Writing", "Presentations"],
    students: 189,
    rating: 4.8,
    lessonsCreated: 38,
    status: "active",
    joinedDate: "2023-08-20",
  },
  {
    id: 3,
    name: "Sarah Chen",
    email: "sarah.c@exply.com",
    grades: ["Adults", "Professional"],
    topics: ["Academic Writing", "IELTS Preparation", "Advanced Grammar"],
    students: 156,
    rating: 4.7,
    lessonsCreated: 52,
    status: "active",
    joinedDate: "2023-05-10",
  },
  {
    id: 4,
    name: "Michael Brown",
    email: "michael.b@exply.com",
    grades: ["Elementary"],
    topics: ["Phonics", "Basic Vocabulary", "Simple Sentences"],
    students: 98,
    rating: 4.6,
    lessonsCreated: 28,
    status: "active",
    joinedDate: "2023-09-01",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.t@exply.com",
    grades: ["Middle School", "High School"],
    topics: ["Creative Writing", "Literature Analysis", "Essay Writing"],
    students: 145,
    rating: 4.8,
    lessonsCreated: 41,
    status: "pending",
    joinedDate: "2024-01-05",
  },
  {
    id: 6,
    name: "David Kim",
    email: "david.k@exply.com",
    grades: ["Adults", "Professional"],
    topics: ["Technical English", "Email Writing", "Corporate Communication"],
    students: 112,
    rating: 4.5,
    lessonsCreated: 22,
    status: "inactive",
    joinedDate: "2023-07-22",
  },
]

const grades = [
  "Elementary",
  "Middle School",
  "High School",
  "Adults",
  "Professional",
]

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || teacher.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.status === "active").length,
    totalStudents: teachers.reduce((acc, t) => acc + t.students, 0),
    totalLessons: teachers.reduce((acc, t) => acc + t.lessonsCreated, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">
            Teachers
          </h1>
          <p className="text-muted-foreground">
            Manage teacher accounts and their content
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Add New Teacher
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <Input placeholder="Enter name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input type="email" placeholder="Enter email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Teaching Grades
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grades" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade.toLowerCase()}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Specialization Topics
                </label>
                <Input placeholder="e.g., Grammar, Vocabulary, Business English" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Send Invitation
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
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Teachers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
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
                {stats.totalStudents.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalLessons}
              </p>
              <p className="text-sm text-muted-foreground">Lessons Created</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teachers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {teacher.email}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {teacher.grades.map((grade) => (
                  <Badge key={grade} variant="secondary" className="text-xs">
                    {grade}
                  </Badge>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Specializations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.topics.slice(0, 3).map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="text-xs border-primary/30 text-primary"
                    >
                      {topic}
                    </Badge>
                  ))}
                  {teacher.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{teacher.topics.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    {teacher.students}
                  </p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">
                    {teacher.lessonsCreated}
                  </p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-lg font-bold text-foreground">
                      {teacher.rating}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Badge
                  variant={
                    teacher.status === "active"
                      ? "default"
                      : teacher.status === "pending"
                      ? "secondary"
                      : "outline"
                  }
                  className={
                    teacher.status === "active"
                      ? "bg-accent/20 text-accent hover:bg-accent/30"
                      : teacher.status === "pending"
                      ? "bg-amber-500/20 text-amber-400"
                      : ""
                  }
                >
                  {teacher.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Joined {new Date(teacher.joinedDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No teachers found matching your search
          </p>
        </div>
      )}
    </div>
  )
}
