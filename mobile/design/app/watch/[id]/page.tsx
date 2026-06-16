"use client"

import { useState } from "react"
import Link from "next/link"
import { VideoPlayer } from "@/components/watch/video-player"
import { VideoQuiz } from "@/components/watch/video-quiz"
import { VideoTranscript } from "@/components/watch/video-transcript"
import { VideoVocabulary } from "@/components/watch/video-vocabulary"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, FileText, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock video data
const videoData = {
  id: "1",
  title: "The Office: Business Meeting",
  description: "Learn professional meeting vocabulary and phrases through this hilarious scene from The Office. Michael attempts to lead a serious business meeting with unexpected results.",
  level: "B1",
  duration: "24:30",
  xp: 150,
}

const quizQuestions = [
  {
    id: 1,
    timestamp: "2:30",
    question: "What does 'synergy' mean in a business context?",
    options: [
      "Working together to achieve more",
      "A type of meeting",
      "Company profit",
      "Employee benefits"
    ],
    correct: 0
  },
  {
    id: 2,
    timestamp: "5:15",
    question: "In the video, what expression did Michael use to start the meeting?",
    options: [
      "Let's begin",
      "Let's get this show on the road",
      "We should start now",
      "Meeting time"
    ],
    correct: 1
  },
  {
    id: 3,
    timestamp: "8:45",
    question: "What is the meaning of 'to table a discussion'?",
    options: [
      "To put papers on the table",
      "To postpone discussion to a later time",
      "To end a meeting",
      "To start arguing"
    ],
    correct: 1
  },
  {
    id: 4,
    timestamp: "12:00",
    question: "Which phrase means to summarize the main points?",
    options: [
      "To beat around the bush",
      "To cut to the chase",
      "To wrap up",
      "To touch base"
    ],
    correct: 2
  },
  {
    id: 5,
    timestamp: "18:30",
    question: "What does 'action items' refer to in meetings?",
    options: [
      "Physical activities",
      "Tasks to be completed after the meeting",
      "Meeting rules",
      "Items on sale"
    ],
    correct: 1
  }
]

const vocabulary = [
  { word: "Synergy", definition: "The interaction of elements that when combined produce a total effect greater than the sum of the individual elements", example: "Our departments work in synergy to achieve company goals." },
  { word: "Agenda", definition: "A list of items to be discussed at a formal meeting", example: "The first item on today's agenda is quarterly sales." },
  { word: "Minutes", definition: "A written record of what was said and decided during a meeting", example: "Sarah will take minutes during the meeting." },
  { word: "Stakeholder", definition: "A person with an interest or concern in something", example: "We need to consider all stakeholders before making this decision." },
  { word: "Deliverables", definition: "Items or services that must be provided as part of a project", example: "The project deliverables include the final report and presentation." },
]

const transcript = [
  { time: "0:00", speaker: "Michael", text: "Alright everybody, let's get this show on the road. Conference room, five minutes." },
  { time: "0:15", speaker: "Jim", text: "Michael, we're already in the conference room." },
  { time: "0:20", speaker: "Michael", text: "Perfect! Then we're ahead of schedule. First item on the agenda: synergy." },
  { time: "0:35", speaker: "Dwight", text: "Synergy is when we all work together as one unit, like bees in a hive." },
  { time: "0:50", speaker: "Michael", text: "Exactly, Dwight! We need more of that bee energy. Buzzing around, making honey... making money." },
  { time: "1:05", speaker: "Stanley", text: "Can we just get to the actual business?" },
  { time: "1:15", speaker: "Michael", text: "Stanley, patience. We need to touch base on several key deliverables first." },
]

type Tab = "vocabulary" | "transcript" | "quiz"

export default function WatchPage() {
  const [isVideoComplete, setIsVideoComplete] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("vocabulary")
  const [quizCompleted, setQuizCompleted] = useState(false)

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
    { id: "transcript", label: "Transcript", icon: FileText },
    { id: "quiz", label: "Quiz", icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            href="/catalog" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Catalog</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ChameleonMascot size="sm" mood="happy" animate={false} />
            <span className="font-bold font-[family-name:var(--font-display)]">Exply</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{videoData.xp} XP</span>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player Column */}
            <div className="lg:col-span-2 space-y-6">
              <VideoPlayer 
                onComplete={() => setIsVideoComplete(true)}
                isComplete={isVideoComplete}
              />
              
              {/* Video Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">
                    {videoData.level}
                  </span>
                  <span className="text-sm text-muted-foreground">{videoData.duration}</span>
                </div>
                <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-3">
                  {videoData.title}
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  {videoData.description}
                </p>
              </div>

              {/* Mobile Tabs */}
              <div className="lg:hidden">
                <div className="flex border-b border-border">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                        activeTab === tab.id
                          ? "text-primary border-primary"
                          : "text-muted-foreground border-transparent hover:text-foreground"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="py-6">
                  {activeTab === "vocabulary" && (
                    <VideoVocabulary vocabulary={vocabulary} />
                  )}
                  {activeTab === "transcript" && (
                    <VideoTranscript transcript={transcript} />
                  )}
                  {activeTab === "quiz" && (
                    <VideoQuiz 
                      questions={quizQuestions}
                      isVideoComplete={isVideoComplete}
                      onComplete={() => setQuizCompleted(true)}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                      activeTab === tab.id
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="bg-card border border-border rounded-xl p-4 max-h-[600px] overflow-y-auto">
                {activeTab === "vocabulary" && (
                  <VideoVocabulary vocabulary={vocabulary} />
                )}
                {activeTab === "transcript" && (
                  <VideoTranscript transcript={transcript} />
                )}
                {activeTab === "quiz" && (
                  <VideoQuiz 
                    questions={quizQuestions}
                    isVideoComplete={isVideoComplete}
                    onComplete={() => setQuizCompleted(true)}
                  />
                )}
              </div>

              {/* Completion Status */}
              {quizCompleted && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                  <ChameleonMascot size="sm" mood="excited" className="mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Lesson Complete!</p>
                  <p className="text-sm text-muted-foreground mb-3">You earned {videoData.xp} XP</p>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/catalog">Next Lesson</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
