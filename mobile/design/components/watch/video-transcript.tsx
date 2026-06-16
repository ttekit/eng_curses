"use client"

import { cn } from "@/lib/utils"

interface TranscriptLine {
  time: string
  speaker: string
  text: string
}

interface VideoTranscriptProps {
  transcript: TranscriptLine[]
}

const speakerColors: Record<string, string> = {
  "Michael": "text-primary",
  "Jim": "text-accent",
  "Dwight": "text-chart-3",
  "Stanley": "text-chart-4",
}

export function VideoTranscript({ transcript }: VideoTranscriptProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Transcript</h3>
      
      <div className="space-y-3">
        {transcript.map((line, index) => (
          <div 
            key={index}
            className="group flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <span className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5">
              {line.time}
            </span>
            <div>
              <span className={cn(
                "text-sm font-medium",
                speakerColors[line.speaker] || "text-foreground"
              )}>
                {line.speaker}:
              </span>
              <p className="text-sm text-foreground leading-relaxed">
                {line.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground text-center pt-4">
        Click on any line to jump to that point in the video
      </p>
    </div>
  )
}
