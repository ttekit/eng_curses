"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { User, Bell, Shield, Palette, X, Plus, Save } from "lucide-react"

interface ProfileSettingsProps {
  user: {
    name: string
    email: string
    job: string
    education: string
    hobbies: string[]
    lovedGenres: string[]
    hatedGenres: string[]
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [job, setJob] = useState(user.job)
  const [education, setEducation] = useState(user.education)
  const [hobbies, setHobbies] = useState(user.hobbies)
  const [lovedGenres, setLovedGenres] = useState(user.lovedGenres)
  const [hatedGenres, setHatedGenres] = useState(user.hatedGenres)
  const [newHobby, setNewHobby] = useState("")
  
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    achievements: true,
    newContent: false,
    marketing: false,
  })
  
  const [preferences, setPreferences] = useState({
    autoplayNext: true,
    showSubtitles: true,
    playbackSpeed: "1",
    videoQuality: "auto",
    theme: "dark",
  })

  const addHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()])
      setNewHobby("")
    }
  }

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter(h => h !== hobby))
  }

  const toggleGenre = (genre: string, list: "loved" | "hated") => {
    if (list === "loved") {
      if (lovedGenres.includes(genre)) {
        setLovedGenres(lovedGenres.filter(g => g !== genre))
      } else {
        setLovedGenres([...lovedGenres, genre])
        setHatedGenres(hatedGenres.filter(g => g !== genre))
      }
    } else {
      if (hatedGenres.includes(genre)) {
        setHatedGenres(hatedGenres.filter(g => g !== genre))
      } else {
        setHatedGenres([...hatedGenres, genre])
        setLovedGenres(lovedGenres.filter(g => g !== genre))
      }
    }
  }

  const allGenres = ["Action", "Comedy", "Drama", "Sci-Fi", "Documentary", "Horror", "Romance", "Thriller", "Animation", "Musical"]

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal details and preferences for personalized learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/50 border-border"
                />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="bg-secondary/50 border-border"
                />
              </Field>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Job / Occupation</FieldLabel>
                <Input 
                  value={job} 
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="bg-secondary/50 border-border"
                />
              </Field>
              <Field>
                <FieldLabel>Education</FieldLabel>
                <Input 
                  value={education} 
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Bachelor's Degree"
                  className="bg-secondary/50 border-border"
                />
              </Field>
            </div>
            
            <Field>
              <FieldLabel>Hobbies & Interests</FieldLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {hobbies.map((hobby) => (
                  <Badge 
                    key={hobby} 
                    variant="secondary"
                    className="bg-primary/20 text-primary hover:bg-primary/30 pr-1"
                  >
                    {hobby}
                    <button
                      onClick={() => removeHobby(hobby)}
                      className="ml-1 p-0.5 hover:bg-primary/20 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={newHobby}
                  onChange={(e) => setNewHobby(e.target.value)}
                  placeholder="Add a hobby..."
                  className="bg-secondary/50 border-border"
                  onKeyDown={(e) => e.key === "Enter" && addHobby()}
                />
                <Button onClick={addHobby} size="icon" variant="secondary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Field>
            
            <Separator />
            
            <div>
              <FieldLabel className="mb-3 block">Film Genre Preferences</FieldLabel>
              <p className="text-sm text-muted-foreground mb-4">
                Help us personalize content by selecting genres you love or want to avoid
              </p>
              <div className="flex flex-wrap gap-2">
                {allGenres.map((genre) => {
                  const isLoved = lovedGenres.includes(genre)
                  const isHated = hatedGenres.includes(genre)
                  return (
                    <div key={genre} className="flex items-center">
                      <button
                        onClick={() => toggleGenre(genre, "loved")}
                        className={`px-3 py-1.5 rounded-l-lg text-sm font-medium transition-colors ${
                          isLoved 
                            ? "bg-accent text-accent-foreground" 
                            : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                        }`}
                      >
                        {genre}
                      </button>
                      <button
                        onClick={() => toggleGenre(genre, "hated")}
                        className={`px-2 py-1.5 rounded-r-lg transition-colors ${
                          isHated 
                            ? "bg-destructive text-destructive-foreground" 
                            : "bg-secondary/50 hover:bg-secondary/80 text-muted-foreground"
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-accent" /> Love it
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-destructive" /> Avoid
                </span>
              </div>
            </div>
          </FieldGroup>
          
          <div className="mt-6 flex justify-end">
            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Notifications */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "dailyReminder", label: "Daily Learning Reminder", description: "Get reminded to practice every day" },
            { key: "weeklyReport", label: "Weekly Progress Report", description: "Receive a summary of your weekly progress" },
            { key: "achievements", label: "Achievement Alerts", description: "Get notified when you unlock achievements" },
            { key: "newContent", label: "New Content Alerts", description: "Be notified when new videos are added" },
            { key: "marketing", label: "Marketing Emails", description: "Receive tips, offers, and updates" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch 
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, [item.key]: checked })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Learning Preferences */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Learning Preferences
          </CardTitle>
          <CardDescription>
            Customize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Playback Speed</FieldLabel>
                <Select 
                  value={preferences.playbackSpeed}
                  onValueChange={(value) => setPreferences({ ...preferences, playbackSpeed: value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x (Slow)</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x (Normal)</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x (Fast)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              
              <Field>
                <FieldLabel>Video Quality</FieldLabel>
                <Select 
                  value={preferences.videoQuality}
                  onValueChange={(value) => setPreferences({ ...preferences, videoQuality: value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="1080p">1080p HD</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-play Next Video</p>
                  <p className="text-sm text-muted-foreground">Automatically play the next video in the series</p>
                </div>
                <Switch 
                  checked={preferences.autoplayNext}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, autoplayNext: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Show Subtitles by Default</p>
                  <p className="text-sm text-muted-foreground">Always show English subtitles when available</p>
                </div>
                <Switch 
                  checked={preferences.showSubtitles}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, showSubtitles: checked })
                  }
                />
              </div>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
      
      {/* Danger Zone */}
      <Card className="bg-card/50 border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <Shield className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
            <div>
              <p className="font-medium text-foreground">Reset Progress</p>
              <p className="text-sm text-muted-foreground">Clear all your learning progress and start fresh</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  Reset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your learning progress, achievements, and vocabulary data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Reset Progress</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
            <div>
              <p className="font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Your account and all associated data will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Delete Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
