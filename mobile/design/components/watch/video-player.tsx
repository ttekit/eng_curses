"use client"

import { useState, useRef } from "react"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward,
  Subtitles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface VideoPlayerProps {
  onComplete: () => void
  isComplete: boolean
}

export function VideoPlayer({ onComplete, isComplete }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    
    // Simulate video progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            onComplete()
            setIsPlaying(false)
            return 100
          }
          return prev + 0.5
        })
      }, 500)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const formatTime = (percent: number) => {
    const totalSeconds = (percent / 100) * (24 * 60 + 30) // 24:30 video
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div 
      className="relative aspect-video bg-muted rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
        {!isPlaying && progress === 0 && (
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors"
          >
            <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground ml-1" />
          </button>
        )}
      </div>

      {/* Subtitles */}
      {showSubtitles && isPlaying && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-lg max-w-lg text-center">
          <p className="text-foreground text-lg">
            {progress < 20 && "Alright everybody, let's get this show on the road."}
            {progress >= 20 && progress < 40 && "Conference room, five minutes."}
            {progress >= 40 && progress < 60 && "First item on the agenda: synergy."}
            {progress >= 60 && progress < 80 && "We need more of that bee energy."}
            {progress >= 80 && "We need to touch base on several key deliverables."}
          </p>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
            Level B1
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={cn(
                "p-2 rounded-full transition-colors",
                showSubtitles 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background/50 text-foreground hover:bg-background/70"
              )}
            >
              <Subtitles className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-background/50 hover:bg-background/70 text-foreground transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Play/Pause */}
        {(showControls || !isPlaying) && progress > 0 && (
          <div className="absolute inset-0 flex items-center justify-center gap-4">
            <button className="p-3 rounded-full bg-background/30 hover:bg-background/50 text-foreground transition-colors">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-primary-foreground" />
              ) : (
                <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground ml-1" />
              )}
            </button>
            <button className="p-3 rounded-full bg-background/30 hover:bg-background/50 text-foreground transition-colors">
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={(value) => setProgress(value[0])}
            className="cursor-pointer"
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-background/30 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-foreground" />
                ) : (
                  <Play className="w-5 h-5 text-foreground" />
                )}
              </button>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-background/30 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-foreground" />
                ) : (
                  <Volume2 className="w-5 h-5 text-foreground" />
                )}
              </button>
              
              <span className="text-sm text-foreground">
                {formatTime(progress)} / 24:30
              </span>
            </div>
            
            <button className="p-2 hover:bg-background/30 rounded-lg transition-colors">
              <Maximize className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Completion Overlay */}
      {isComplete && !isPlaying && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Video Complete!</h3>
            <p className="text-muted-foreground">Take the quiz to earn your XP</p>
          </div>
        </div>
      )}
    </div>
  )
}
