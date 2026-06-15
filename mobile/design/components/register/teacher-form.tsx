"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Plus, X } from "lucide-react"

interface TeacherFormProps {
  onComplete: () => void
}

const gradeOptions = [
  "Elementary School",
  "Middle School",
  "High School",
  "University",
  "Corporate Training",
  "Private Tutoring"
]

export function TeacherForm({ onComplete }: TeacherFormProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState("")

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade)
        ? prev.filter((g) => g !== grade)
        : [...prev, grade]
    )
  }

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()])
      setNewTopic("")
    }
  }

  const removeTopic = (topic: string) => {
    setTopics(topics.filter((t) => t !== topic))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGrades.length > 0) {
      onComplete()
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <ChameleonMascot size="sm" mood="happy" animate={false} />
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          Teacher Profile
        </h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Tell us about your teaching experience
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grade Selection */}
        <div className="space-y-3">
          <Label>What grades do you teach?</Label>
          <div className="flex flex-wrap gap-2">
            {gradeOptions.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => toggleGrade(grade)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedGrades.includes(grade)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <Label htmlFor="topic">Learning Topics (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Add topics you want to focus on with your students
          </p>
          
          <div className="flex gap-2">
            <Input
              id="topic"
              type="text"
              placeholder="e.g., Business English, Grammar"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTopic()
                }
              }}
              className="bg-input border-border"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addTopic}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                >
                  {topic}
                  <button
                    type="button"
                    onClick={() => removeTopic(topic)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          disabled={selectedGrades.length === 0}
        >
          Continue to Level Test
        </Button>
      </form>
    </div>
  )
}
