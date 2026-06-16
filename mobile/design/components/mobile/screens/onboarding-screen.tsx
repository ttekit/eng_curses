"use client"

import { useState } from "react"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, Sparkles, Clapperboard, Target } from "lucide-react"

interface OnboardingScreenProps {
  onFinish: () => void
  onTest: () => void
}

const slides = [
  {
    mood: "waving" as const,
    icon: Sparkles,
    title: "Meet Rex",
    body: "Your color-changing companion adapts every lesson to how you learn best.",
  },
  {
    mood: "excited" as const,
    icon: Clapperboard,
    title: "Learn from real video",
    body: "Watch shows, clips, and stories you love, then practice what you just heard.",
  },
  {
    mood: "thinking" as const,
    icon: Target,
    title: "Personalized for you",
    body: "Tell us your interests and goals. Exply builds a path that fits your life.",
  },
]

export function OnboardingScreen({ onFinish, onTest }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const isLast = index === slides.length - 1
  const Icon = slide.icon

  return (
    <div className="flex h-full flex-col px-6 pb-6">
      <div className="flex justify-end pt-2">
        <button onClick={onFinish} className="text-sm text-muted-foreground font-medium">
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" aria-hidden />
          <ChameleonMascot size="xl" mood={slide.mood} />
        </div>

        <div className="flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-primary">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Step {index + 1} of 3</span>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-bold text-foreground text-balance">{slide.title}</h2>
          <p className="text-muted-foreground leading-relaxed text-pretty px-2">{slide.body}</p>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 pb-6">
        {slides.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-2 bg-border",
            )}
          />
        ))}
      </div>

      <div className="space-y-3">
        {isLast ? (
          <>
            <Button onClick={onTest} className="w-full h-12 text-base font-semibold">
              Take the level test
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button onClick={onFinish} variant="ghost" className="w-full h-11">
              Skip for now
            </Button>
          </>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)} className="w-full h-12 text-base font-semibold">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
