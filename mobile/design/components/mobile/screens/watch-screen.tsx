"use client"

import { useState } from "react"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ArrowLeft, Play, Pause, Subtitles, Check, X, RotateCcw, BookOpen } from "lucide-react"

interface WatchScreenProps {
  videoId: string | null
  onBack: () => void
}

const vocab = [
  { word: "commute", meaning: "to travel to and from work" },
  { word: "rush hour", meaning: "the busiest travel time of day" },
  { word: "landmark", meaning: "a famous, easily recognized place" },
]

const quizQuestions = [
  {
    q: "Where does the story take place?",
    options: ["London", "New York City", "Sydney", "Toronto"],
    answer: 1,
  },
  {
    q: "What does 'commute' mean?",
    options: ["To cook food", "To travel to work", "To take a nap", "To make a call"],
    answer: 1,
  },
]

export function WatchScreen({ videoId, onBack }: WatchScreenProps) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showSubs, setShowSubs] = useState(true)
  const [tab, setTab] = useState<"vocab" | "transcript">("vocab")

  // Quiz state
  const [quizOpen, setQuizOpen] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  const simulateWatch = () => {
    setPlaying(true)
    setProgress(100)
    setTimeout(() => {
      setPlaying(false)
      setFinished(true)
    }, 600)
  }

  const question = quizQuestions[qIndex]
  const isLastQ = qIndex === quizQuestions.length - 1

  const checkAnswer = () => {
    if (selected === null) return
    setRevealed(true)
    if (selected === question.answer) setScore((s) => s + 1)
  }

  const nextQuestion = () => {
    if (isLastQ) {
      setQuizDone(true)
    } else {
      setQIndex((i) => i + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Video area */}
      <div className="relative">
        <div className="relative aspect-video w-full bg-gradient-to-br from-primary via-primary/60 to-accent/50">
          <div className="absolute inset-0 bg-foreground/10" />
          {/* Back button */}
          <button
            onClick={onBack}
            aria-label="Go back"
            className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Subtitles */}
          {showSubs && (
            <div className="absolute bottom-12 inset-x-0 px-4 text-center">
              <span className="inline-block rounded bg-background/80 px-2 py-1 text-xs font-medium text-foreground">
                &quot;Every morning, I commute into the city...&quot;
              </span>
            </div>
          )}

          {/* Center play */}
          <button
            onClick={() => (playing ? setPlaying(false) : simulateWatch())}
            aria-label={playing ? "Pause" : "Play"}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/85">
              {playing ? (
                <Pause className="h-6 w-6 fill-foreground text-foreground" />
              ) : (
                <Play className="h-6 w-6 fill-foreground text-foreground" />
              )}
            </span>
          </button>

          {/* Controls bar */}
          <div className="absolute bottom-0 inset-x-0 px-3 pb-2">
            <Progress value={progress} className="h-1 mb-2" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">
                {progress === 100 ? "12:00" : "0:00"} / 12:00
              </span>
              <button
                onClick={() => setShowSubs((s) => !s)}
                aria-label="Toggle subtitles"
                className={cn("rounded p-1", showSubs ? "text-foreground" : "text-foreground/50")}
              >
                <Subtitles className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video info */}
      <div className="px-5 pt-4">
        <Badge className="mb-2 bg-primary text-primary-foreground border-0">B1 · Listening</Badge>
        <h2 className="font-display text-lg font-bold text-foreground">A Day in New York City</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Follow Maya through her daily routine and learn travel and work vocabulary.
        </p>
      </div>

      {/* Post-video quiz CTA */}
      <div className="px-5 mt-4">
        {!finished ? (
          <div className="flex items-center gap-3 rounded-xl bg-secondary/60 border border-border p-3">
            <ChameleonMascot size="sm" mood="thinking" animate={false} className="!w-10 !h-10 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Finish the video to unlock your comprehension quiz.
            </p>
          </div>
        ) : !quizOpen ? (
          <button
            onClick={() => setQuizOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl bg-primary/10 border border-primary/30 p-3 text-left"
          >
            <ChameleonMascot size="sm" mood="excited" animate={false} className="!w-10 !h-10 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Quiz unlocked!</p>
              <p className="text-xs text-muted-foreground">Test what you learned · 2 questions</p>
            </div>
            <Play className="h-4 w-4 fill-primary text-primary" />
          </button>
        ) : null}
      </div>

      {/* Inline quiz */}
      {quizOpen && (
        <div className="px-5 mt-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            {!quizDone ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-primary">
                    Question {qIndex + 1} of {quizQuestions.length}
                  </span>
                  <Progress value={((qIndex + 1) / quizQuestions.length) * 100} className="h-1.5 w-20" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-3 text-balance">{question.q}</h3>
                <div className="space-y-2">
                  {question.options.map((opt, i) => {
                    const isCorrect = i === question.answer
                    const isSelected = i === selected
                    return (
                      <button
                        key={i}
                        onClick={() => !revealed && setSelected(i)}
                        disabled={revealed}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          !revealed && isSelected && "border-primary bg-primary/10",
                          !revealed && !isSelected && "border-border bg-background",
                          revealed && isCorrect && "border-accent bg-accent/15 text-foreground",
                          revealed && isSelected && !isCorrect && "border-destructive bg-destructive/15",
                          revealed && !isCorrect && !isSelected && "border-border bg-background opacity-60",
                        )}
                      >
                        <span>{opt}</span>
                        {revealed && isCorrect && <Check className="h-4 w-4 text-accent" />}
                        {revealed && isSelected && !isCorrect && <X className="h-4 w-4 text-destructive" />}
                      </button>
                    )
                  })}
                </div>
                {!revealed ? (
                  <Button onClick={checkAnswer} disabled={selected === null} className="w-full h-10 mt-4">
                    Check answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="w-full h-10 mt-4">
                    {isLastQ ? "See result" : "Next question"}
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-2">
                <ChameleonMascot size="md" mood="excited" className="mx-auto !w-20 !h-20" />
                <h3 className="font-display text-lg font-bold text-foreground mt-2">
                  {score === quizQuestions.length ? "Perfect!" : "Nice work!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  You got {score} of {quizQuestions.length} correct.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQIndex(0)
                      setSelected(null)
                      setRevealed(false)
                      setScore(0)
                      setQuizDone(false)
                    }}
                    className="flex-1 h-10 bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retry
                  </Button>
                  <Button onClick={onBack} className="flex-1 h-10">
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs: vocab / transcript */}
      <div className="px-5 mt-5">
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          <button
            onClick={() => setTab("vocab")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors",
              tab === "vocab" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Vocabulary
          </button>
          <button
            onClick={() => setTab("transcript")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors",
              tab === "transcript" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            <Subtitles className="h-3.5 w-3.5" />
            Transcript
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {tab === "vocab"
            ? vocab.map((v) => (
                <div key={v.word} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-sm font-semibold text-foreground capitalize">{v.word}</p>
                  <p className="text-xs text-muted-foreground">{v.meaning}</p>
                </div>
              ))
            : (
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-medium">0:05</span> — Every morning, I commute into the city.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-medium">0:18</span> — Rush hour can be really busy here.
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-medium">0:32</span> — My favorite landmark is the old bridge.
                </p>
              </div>
            )}
        </div>
      </div>

      <div className="h-6" />
    </div>
  )
}
