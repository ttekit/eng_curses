"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, Lock, ArrowRight } from "lucide-react"

interface Question {
  id: number
  timestamp: string
  question: string
  options: string[]
  correct: number
}

interface VideoQuizProps {
  questions: Question[]
  isVideoComplete: boolean
  onComplete: () => void
}

export function VideoQuiz({ questions, isVideoComplete, onComplete }: VideoQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResults, setShowResults] = useState(false)

  if (!isVideoComplete) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Quiz Locked</h3>
        <p className="text-muted-foreground text-sm">
          Complete watching the video to unlock the quiz and earn XP.
        </p>
      </div>
    )
  }

  if (showResults) {
    const percentage = Math.round((correctCount / questions.length) * 100)
    
    return (
      <div className="text-center py-4">
        <ChameleonMascot 
          size="md" 
          mood={percentage >= 80 ? "excited" : percentage >= 50 ? "happy" : "thinking"} 
          className="mx-auto mb-4"
        />
        
        <h3 className="text-xl font-bold text-foreground mb-2">Quiz Complete!</h3>
        
        <div className="bg-muted rounded-xl p-4 mb-4">
          <p className="text-3xl font-bold text-primary mb-1">
            {correctCount}/{questions.length}
          </p>
          <p className="text-sm text-muted-foreground">
            {percentage}% correct
          </p>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">
          {percentage >= 80 
            ? "Excellent work! You've mastered this lesson."
            : percentage >= 50 
            ? "Good job! Consider reviewing the vocabulary."
            : "Keep practicing! Review the video and try again."}
        </p>
        
        <Button 
          onClick={onComplete}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Complete Lesson
        </Button>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const isCorrect = selectedAnswer === question.correct

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return
    setSelectedAnswer(index)
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    
    if (!isAnswered) {
      setIsAnswered(true)
      if (selectedAnswer === question.correct) {
        setCorrectCount(prev => prev + 1)
      }
    } else {
      // Move to next question
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setIsAnswered(false)
      } else {
        setShowResults(true)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          at {question.timestamp}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>
      
      {/* Question */}
      <h3 className="text-lg font-semibold text-foreground leading-relaxed">
        {question.question}
      </h3>
      
      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index
          const showCorrect = isAnswered && index === question.correct
          const showWrong = isAnswered && isSelected && !isCorrect
          
          return (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={isAnswered}
              className={cn(
                "w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3",
                !isAnswered && isSelected && "border-primary bg-primary/10",
                !isAnswered && !isSelected && "border-border bg-card hover:border-primary/50",
                showCorrect && "border-accent bg-accent/10",
                showWrong && "border-destructive bg-destructive/10",
                isAnswered && !showCorrect && !showWrong && "opacity-50"
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                !isAnswered && isSelected && "bg-primary text-primary-foreground",
                !isAnswered && !isSelected && "bg-muted text-muted-foreground",
                showCorrect && "bg-accent text-accent-foreground",
                showWrong && "bg-destructive text-destructive-foreground"
              )}>
                {showCorrect ? (
                  <CheckCircle className="w-4 h-4" />
                ) : showWrong ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span className="text-sm text-foreground">{option}</span>
            </button>
          )
        })}
      </div>
      
      {/* Feedback */}
      {isAnswered && (
        <div className={cn(
          "p-3 rounded-lg text-sm",
          isCorrect ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
        )}>
          {isCorrect 
            ? "Correct! Well done."
            : `Not quite. The correct answer is: ${question.options[question.correct]}`}
        </div>
      )}
      
      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={selectedAnswer === null}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {!isAnswered ? "Check Answer" : currentQuestion < questions.length - 1 ? (
          <>Next Question <ArrowRight className="w-4 h-4 ml-2" /></>
        ) : (
          "See Results"
        )}
      </Button>
    </div>
  )
}
