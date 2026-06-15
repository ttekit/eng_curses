"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileProgress } from "@/components/profile/profile-progress"
import { ProfileAchievements } from "@/components/profile/profile-achievements"
import { ProfileActivity } from "@/components/profile/profile-activity"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Trophy, Clock, Settings, BookOpen } from "lucide-react"

// Mock user data
const userData = {
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  avatar: null,
  role: "adult" as const,
  level: "B1",
  joinDate: "2024-01-15",
  streak: 12,
  totalWatchTime: 4520, // minutes
  videosCompleted: 47,
  testsCompleted: 38,
  averageScore: 82,
  job: "Software Engineer",
  education: "Bachelor's in Computer Science",
  hobbies: ["Reading", "Gaming", "Cooking"],
  lovedGenres: ["Sci-Fi", "Documentary", "Comedy"],
  hatedGenres: ["Horror", "Romance"],
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileHeader user={userData} />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="bg-secondary/50 p-1 rounded-xl w-full sm:w-auto flex flex-wrap justify-start gap-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="progress"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <ProfileStats user={userData} />
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              <ProfileProgress />
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-6">
              <ProfileAchievements />
            </TabsContent>
            
            <TabsContent value="activity" className="mt-6">
              <ProfileActivity />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <ProfileSettings user={userData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
