"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Search,
  Plus,
  MoreVertical,
  BookOpen,
  Video,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  FolderOpen,
  Layers,
} from "lucide-react"

const topicCategories = [
  {
    id: 1,
    name: "Business English",
    description: "Professional communication and workplace vocabulary",
    icon: "💼",
    topics: [
      {
        id: 101,
        name: "Business Meetings",
        videos: 12,
        tests: 5,
        level: "B1",
      },
      {
        id: 102,
        name: "Email Writing",
        videos: 8,
        tests: 4,
        level: "B1",
      },
      {
        id: 103,
        name: "Presentations",
        videos: 10,
        tests: 4,
        level: "B2",
      },
      {
        id: 104,
        name: "Negotiations",
        videos: 6,
        tests: 3,
        level: "C1",
      },
    ],
  },
  {
    id: 2,
    name: "Travel & Tourism",
    description: "Essential phrases and vocabulary for travelers",
    icon: "✈️",
    topics: [
      {
        id: 201,
        name: "At the Airport",
        videos: 8,
        tests: 3,
        level: "A2",
      },
      {
        id: 202,
        name: "Hotel Conversations",
        videos: 6,
        tests: 3,
        level: "A2",
      },
      {
        id: 203,
        name: "Restaurant Ordering",
        videos: 7,
        tests: 3,
        level: "A1",
      },
      {
        id: 204,
        name: "Asking for Directions",
        videos: 5,
        tests: 2,
        level: "A1",
      },
    ],
  },
  {
    id: 3,
    name: "Daily Life",
    description: "Everyday conversations and common situations",
    icon: "🏠",
    topics: [
      {
        id: 301,
        name: "Shopping",
        videos: 9,
        tests: 4,
        level: "A1",
      },
      {
        id: 302,
        name: "Doctor Visits",
        videos: 6,
        tests: 3,
        level: "A2",
      },
      {
        id: 303,
        name: "Phone Calls",
        videos: 7,
        tests: 3,
        level: "B1",
      },
      {
        id: 304,
        name: "Making Plans",
        videos: 5,
        tests: 2,
        level: "A2",
      },
    ],
  },
  {
    id: 4,
    name: "Academic English",
    description: "Study skills and academic vocabulary",
    icon: "📚",
    topics: [
      {
        id: 401,
        name: "Essay Writing",
        videos: 10,
        tests: 5,
        level: "B2",
      },
      {
        id: 402,
        name: "Research Skills",
        videos: 8,
        tests: 4,
        level: "C1",
      },
      {
        id: 403,
        name: "Academic Vocabulary",
        videos: 12,
        tests: 6,
        level: "B2",
      },
      {
        id: 404,
        name: "Exam Preparation",
        videos: 15,
        tests: 8,
        level: "B2",
      },
    ],
  },
  {
    id: 5,
    name: "Entertainment",
    description: "Movies, music, and pop culture",
    icon: "🎬",
    topics: [
      {
        id: 501,
        name: "Movie Reviews",
        videos: 8,
        tests: 3,
        level: "B1",
      },
      {
        id: 502,
        name: "Music & Lyrics",
        videos: 10,
        tests: 4,
        level: "A2",
      },
      {
        id: 503,
        name: "Sports Talk",
        videos: 7,
        tests: 3,
        level: "B1",
      },
    ],
  },
]

export default function TopicsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1, 2])

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const stats = {
    categories: topicCategories.length,
    topics: topicCategories.reduce((acc, cat) => acc + cat.topics.length, 0),
    totalVideos: topicCategories.reduce(
      (acc, cat) =>
        acc + cat.topics.reduce((sum, topic) => sum + topic.videos, 0),
      0
    ),
    totalTests: topicCategories.reduce(
      (acc, cat) =>
        acc + cat.topics.reduce((sum, topic) => sum + topic.tests, 0),
      0
    ),
  }

  const filteredCategories = topicCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.topics.some((topic) =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">
            Learning Topics
          </h1>
          <p className="text-muted-foreground">
            Organize and manage content categories
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Create Category
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Category Name
                  </label>
                  <Input placeholder="e.g., Business English" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <Textarea
                    placeholder="Brief description of this category"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Icon (emoji)
                  </label>
                  <Input placeholder="e.g., 💼" className="w-20" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Create Topic
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Topic Name
                  </label>
                  <Input placeholder="e.g., Business Meetings" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {topicCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
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
                        <SelectItem value="A1">A1 - Beginner</SelectItem>
                        <SelectItem value="A2">A2 - Elementary</SelectItem>
                        <SelectItem value="B1">B1 - Intermediate</SelectItem>
                        <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                        <SelectItem value="C1">C1 - Advanced</SelectItem>
                        <SelectItem value="C2">C2 - Proficient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.categories}
              </p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.topics}</p>
              <p className="text-sm text-muted-foreground">Topics</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalVideos}
              </p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalTests}
              </p>
              <p className="text-sm text-muted-foreground">Tests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories and topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Categories & Topics */}
      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Collapsible
            key={category.id}
            open={expandedCategories.includes(category.id)}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <Card className="bg-card border-border">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <CardTitle className="text-foreground text-lg">
                          {category.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">
                        {category.topics.length} topics
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Category
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Topic
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {expandedCategories.includes(category.id) ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {category.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">
                              {topic.name}
                            </h4>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {topic.level}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" />
                            {topic.videos}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileQuestion className="w-3.5 h-3.5" />
                            {topic.tests}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No categories or topics found matching your search
          </p>
        </div>
      )}
    </div>
  )
}
