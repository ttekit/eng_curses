"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChameleonMascot } from "@/components/chameleon-mascot"

interface AdultFormProps {
  role: "student" | "adult"
  onComplete: () => void
}

const hobbyOptions = [
  "Reading", "Sports", "Music", "Cooking", "Travel", 
  "Technology", "Art", "Gaming", "Photography", "Fitness"
]

const filmGenres = [
  "Action", "Comedy", "Drama", "Horror", "Sci-Fi",
  "Romance", "Documentary", "Thriller", "Animation", "Fantasy"
]

export function AdultForm({ role, onComplete }: AdultFormProps) {
  const [job, setJob] = useState("")
  const [education, setEducation] = useState("")
  const [hobbies, setHobbies] = useState<string[]>([])
  const [lovedGenres, setLovedGenres] = useState<string[]>([])
  const [hatedGenres, setHatedGenres] = useState<string[]>([])

  const toggleItem = (
    item: string, 
    list: string[], 
    setList: (items: string[]) => void
  ) => {
    setList(
      list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <ChameleonMascot size="sm" mood="happy" animate={false} />
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
          {role === "student" ? "Student Profile" : "Your Profile"}
        </h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Help us personalize your learning experience
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job */}
        <div className="space-y-2">
          <Label htmlFor="job">
            {role === "student" ? "Field of Study" : "Occupation"}
          </Label>
          <Input
            id="job"
            type="text"
            placeholder={role === "student" ? "e.g., Computer Science" : "e.g., Software Engineer"}
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="bg-input border-border"
          />
        </div>

        {/* Education */}
        <div className="space-y-2">
          <Label htmlFor="education">Education Level</Label>
          <Input
            id="education"
            type="text"
            placeholder="e.g., Bachelor's Degree"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="bg-input border-border"
          />
        </div>

        {/* Hobbies */}
        <div className="space-y-3">
          <Label>Hobbies & Interests</Label>
          <div className="flex flex-wrap gap-2">
            {hobbyOptions.map((hobby) => (
              <button
                key={hobby}
                type="button"
                onClick={() => toggleItem(hobby, hobbies, setHobbies)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  hobbies.includes(hobby)
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>

        {/* Loved Film Genres */}
        <div className="space-y-3">
          <Label>Film Genres You Love</Label>
          <p className="text-sm text-muted-foreground">
            We&apos;ll recommend content from these genres
          </p>
          <div className="flex flex-wrap gap-2">
            {filmGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  if (hatedGenres.includes(genre)) return
                  toggleItem(genre, lovedGenres, setLovedGenres)
                }}
                disabled={hatedGenres.includes(genre)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  lovedGenres.includes(genre)
                    ? "bg-primary text-primary-foreground"
                    : hatedGenres.includes(genre)
                    ? "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Hated Film Genres */}
        <div className="space-y-3">
          <Label>Film Genres to Avoid</Label>
          <p className="text-sm text-muted-foreground">
            We&apos;ll filter out content from these genres
          </p>
          <div className="flex flex-wrap gap-2">
            {filmGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  if (lovedGenres.includes(genre)) return
                  toggleItem(genre, hatedGenres, setHatedGenres)
                }}
                disabled={lovedGenres.includes(genre)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  hatedGenres.includes(genre)
                    ? "bg-destructive text-destructive-foreground"
                    : lovedGenres.includes(genre)
                    ? "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
        >
          Continue to Level Test
        </Button>
      </form>
    </div>
  )
}
