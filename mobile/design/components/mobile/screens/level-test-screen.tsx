"use client"

import { useState } from "react"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { X, Check, ArrowRight } from "lucide-react"

interface LevelTestScreenProps {
  onFinish: () => void
  onClose: () => void
}

const questions = [
  {
    q: "She ___ to the gym every morning.",
    options: ["go", "goes", "going", "gone"],
    answer: 1,
  },
  {
    q: "Choose the correct word: I have lived here ___ 2019.",
    options: ["since", "for", "during", "from"],
    answer: 0,
  },
  {
    q: "What does 'to break the ice' mean?",
    options: ["To feel cold", "To start a conversation", "To end a fight", "To cool a drink"],
    answer: 1,
  },
  {
    q: "If I ___ more time, I would travel the world.",
    options: ["have", "had", "will have", "having"],
    answer: 1,
  },
  {
    q: "Pick the synonym for 'enormous':",
    options: ["tiny", "average", "huge", "narrow"],
    answer: 2,
  },
]

export function LevelTestScreen({ onFinish, onClose }: LevelTestScreenProps) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const question = questions[current]
  const isLast = current === questions.length - 1

  const submit = () => {
    if (selected === null) return
    const correct = selected === question.answer
    const newScore = correct ? score + 1 : score
    setScore(newScore)
    if (isLast) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const level = pct >= 80 ? "B2" : pct >= 60 ? "B1" : pct >= 40 ? "A2" : "A1"
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center gap-5">
        <ChameleonMascot size="xl" mood="excited" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">Your level</p>
          <h2 className="font-display text-4xl font-bold text-foreground">{level}</h2>
          <p className="text-muted-foreground text-pretty">
            You scored {score} out of {questions.length}. We&apos;ve personalized your catalog to match.
          </p>
        </div>
        <div className="w-full rounded-xl bg-card border border-border p-4">
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-foreground font-medium">Accuracy</span>
            <span className="text-primary font-bold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
        <Button onClick={onFinish} className="w-full h-12 text-base font-semibold">
          Start learning
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col px-6 pb-6">
      {/* Header */}
      <header className="flex items-center gap-3 pt-2">
        <button onClick={onClose} aria-label="Close test" className="text-muted-foreground">
          <X className="h-5 w-5" />
        </button>
        <Progress value={((current + 1) / questions.length) * 100} className="h-2 flex-1" />
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {current + 1}/{questions.length}
        </span>
      </header>

      {/* Mascot prompt */}
      <div className="flex items-center gap-3 mt-6">
        <ChameleonMascot size="sm" mood="thinking" animate={false} className="!w-12 !h-12 shrink-0" />
        <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-2.5">
          <p className="text-sm text-foreground">Pick the best answer.</p>
        </div>
      </div>

      {/* Question */}
      <h2 className="font-display text-xl font-bold text-foreground mt-6 text-balance leading-snug">
        {question.q}
      </h2>

      {/* Options */}
      <div className="mt-5 space-y-3 flex-1">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
              selected === i
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-foreground",
            )}
          >
            <span>{opt}</span>
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border",
                selected === i ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {selected === i && <Check className="h-3 w-3" />}
            </span>
          </button>
        ))}
      </div>

      <Button onClick={submit} disabled={selected === null} className="w-full h-12 text-base font-semibold mt-4">
        {isLast ? "See my result" : "Next question"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
