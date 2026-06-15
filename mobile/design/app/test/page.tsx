"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TestQuestion } from "@/components/test/test-question"
import { TestResult } from "@/components/test/test-result"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const questions = [
  {
    id: 1,
    question: "Choose the correct word: She ___ to the store yesterday.",
    options: ["go", "goes", "went", "going"],
    correct: 2
  },
  {
    id: 2,
    question: "Which sentence is grammatically correct?",
    options: [
      "I have been living here since 5 years.",
      "I have been living here for 5 years.",
      "I am living here since 5 years.",
      "I live here from 5 years."
    ],
    correct: 1
  },
  {
    id: 3,
    question: "Select the synonym for 'ubiquitous':",
    options: ["Rare", "Everywhere", "Hidden", "Ancient"],
    correct: 1
  },
  {
    id: 4,
    question: "Complete the sentence: If I ___ rich, I would travel the world.",
    options: ["am", "was", "were", "be"],
    correct: 2
  },
  {
    id: 5,
    question: "What does the idiom 'break the ice' mean?",
    options: [
      "To destroy something",
      "To start a conversation in a social setting",
      "To solve a difficult problem",
      "To take a break"
    ],
    correct: 1
  },
  {
    id: 6,
    question: "Choose the correct form: The news ___ very surprising.",
    options: ["are", "is", "were", "have been"],
    correct: 1
  },
  {
    id: 7,
    question: "Which word is a gerund?",
    options: ["Running", "Ran", "Run", "Runner"],
    correct: 0
  },
  {
    id: 8,
    question: "Select the correct passive form: 'Someone stole my bike.'",
    options: [
      "My bike was stolen.",
      "My bike is stolen.",
      "My bike has stolen.",
      "My bike were stolen."
    ],
    correct: 0
  },
  {
    id: 9,
    question: "What is the meaning of 'meticulous'?",
    options: [
      "Careless",
      "Very careful and precise",
      "Fast-moving",
      "Extremely tired"
    ],
    correct: 1
  },
  {
    id: 10,
    question: "Choose the correct preposition: I arrived ___ the airport at 6 PM.",
    options: ["to", "in", "at", "on"],
    correct: 2
  }
]

export default function TestPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null))
  const [showResult, setShowResult] = useState(false)

  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResult(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct) {
        correct++
      }
    })
    return correct
  }

  const getLevel = (score: number) => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 90) return { level: "C1", label: "Advanced" }
    if (percentage >= 70) return { level: "B2", label: "Upper Intermediate" }
    if (percentage >= 50) return { level: "B1", label: "Intermediate" }
    if (percentage >= 30) return { level: "A2", label: "Elementary" }
    return { level: "A1", label: "Beginner" }
  }

  if (showResult) {
    const score = calculateScore()
    const level = getLevel(score)
    return (
      <TestResult 
        score={score} 
        total={questions.length} 
        level={level}
        onContinue={() => router.push("/catalog")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Exit Test</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ChameleonMascot size="sm" mood="thinking" animate={false} />
            <span className="font-bold font-[family-name:var(--font-display)]">Exply</span>
          </div>
          
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <TestQuestion
          question={questions[currentQuestion]}
          selectedAnswer={answers[currentQuestion]}
          onSelect={handleAnswer}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleNext}
            disabled={answers[currentQuestion] === null}
          >
            {currentQuestion === questions.length - 1 ? "Finish Test" : "Next"}
          </Button>
        </div>
      </main>
    </div>
  )
}
