"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Flame, Calendar, Edit2 } from "lucide-react"

interface ProfileHeaderProps {
  user: {
    name: string
    email: string
    avatar: string | null
    role: "adult" | "student" | "teacher"
    level: string
    joinDate: string
    streak: number
  }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase()
  const joinDate = new Date(user.joinDate)
  const formattedDate = joinDate.toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  })
  
  const roleLabels = {
    adult: "Adult Learner",
    student: "Student",
    teacher: "Teacher"
  }

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-2xl" />
      
      <div className="relative pt-8 px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full shadow-md"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* User info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {user.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0">
                  Level {user.level}
                </Badge>
                <Badge variant="outline" className="border-accent text-accent">
                  {roleLabels[user.role]}
                </Badge>
              </div>
            </div>
            
            <p className="text-muted-foreground">{user.email}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Joined {formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-foreground font-medium">{user.streak} day streak</span>
              </div>
            </div>
          </div>
          
          {/* Chameleon mascot */}
          <div className="hidden lg:block">
            <div className="relative">
              <ChameleonMascot size="lg" mood="happy" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-3 py-1 rounded-full text-xs font-medium shadow-lg whitespace-nowrap">
                Keep going!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
