"use client"

import Link from "next/link"
import { Play, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Video {
  id: string
  title: string
  thumbnail: string
  duration: string
  level: string
  progress?: number
}

interface VideoCardProps {
  video: Video
  showProgress?: boolean
}

const levelColors: Record<string, string> = {
  "A1": "bg-accent text-accent-foreground",
  "A2": "bg-accent text-accent-foreground",
  "B1": "bg-primary/80 text-primary-foreground",
  "B2": "bg-primary text-primary-foreground",
  "C1": "bg-destructive/80 text-destructive-foreground",
  "C2": "bg-destructive text-destructive-foreground",
}

export function VideoCard({ video, showProgress }: VideoCardProps) {
  return (
    <Link 
      href={`/watch/${video.id}`}
      className="group flex-shrink-0 w-[280px] sm:w-[300px]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
        {/* Placeholder image with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-accent/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-foreground fill-foreground" />
          </div>
        </div>
        
        {/* Level Badge */}
        <span className={cn(
          "absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium",
          levelColors[video.level] || "bg-muted text-muted-foreground"
        )}>
          {video.level}
        </span>
        
        {/* Duration */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {video.duration}
        </span>
        
        {/* Progress Bar */}
        {showProgress && video.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${video.progress}%` }}
            />
          </div>
        )}
      </div>
      
      {/* Title */}
      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {video.title}
      </h3>
      
      {/* Progress Text */}
      {showProgress && video.progress !== undefined && (
        <p className="text-sm text-muted-foreground mt-1">
          {video.progress}% watched
        </p>
      )}
    </Link>
  )
}
