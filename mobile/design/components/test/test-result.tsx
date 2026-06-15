"use client"

import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowRight } from "lucide-react"

interface TestResultProps {
  score: number
  total: number
  level: {
    level: string
    label: string
  }
  onContinue: () => void
}

export function TestResult({ score, total, level, onContinue }: TestResultProps) {
  const percentage = Math.round((score / total) * 100)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Mascot celebration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
          <ChameleonMascot size="xl" mood="excited" className="relative mx-auto" />
        </div>

        {/* Result */}
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] mb-2">
          Test Complete!
        </h1>
        <p className="text-muted-foreground mb-8">
          Great job! Here are your results.
        </p>

        {/* Score Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="text-lg font-medium text-foreground">Your Score</span>
          </div>
          
          <div className="text-5xl font-bold text-primary mb-2">
            {score}/{total}
          </div>
          <div className="text-muted-foreground mb-6">
            {percentage}% correct
          </div>

          {/* Level Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-xl border border-primary/20">
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Your Level</p>
              <p className="text-lg font-bold text-primary">{level.level}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Proficiency</p>
              <p className="text-lg font-semibold text-foreground">{level.label}</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-muted-foreground mb-8">
          Based on your results, we&apos;ll personalize your learning content to match your 
          {level.level === "A1" || level.level === "A2" 
            ? " beginner level and help you build strong foundations."
            : level.level === "B1" || level.level === "B2"
            ? " intermediate level and help you advance further."
            : " advanced level with challenging content."}
        </p>

        {/* Continue Button */}
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg w-full"
          onClick={onContinue}
        >
          Start Learning
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
