"use client"

import { cn } from "@/lib/utils"

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
}

interface TestQuestionProps {
  question: Question
  selectedAnswer: number | null
  onSelect: (index: number) => void
}

export function TestQuestion({ question, selectedAnswer, onSelect }: TestQuestionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all",
              selectedAnswer === index
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                  selectedAnswer === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-base">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
