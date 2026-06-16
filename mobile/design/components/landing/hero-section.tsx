"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Play, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.65_0.25_295_/_0.15)_0%,_transparent_50%)]" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Personalized Learning</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] leading-tight text-balance">
              Learn English{" "}
              <span className="text-primary">Your Way</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Adaptive video lessons that match your interests, level, and learning style. 
              Just like a chameleon adapts to its environment, we adapt to you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg animate-glow"
                asChild
              >
                <Link href="/register">
                  Start Learning Free
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-border hover:bg-muted"
                asChild
              >
                <Link href="/catalog" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Browse Content
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-2xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Active Learners</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">1000+</p>
                <p className="text-sm text-muted-foreground">Video Lessons</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-2xl font-bold text-foreground">4.9</p>
                <p className="text-sm text-muted-foreground">User Rating</p>
              </div>
            </div>
          </div>
          
          {/* Right content - Mascot */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Floating elements */}
              <div className="absolute -top-8 -left-8 animate-float" style={{ animationDelay: "0s" }}>
                <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
                  <p className="text-sm font-medium text-foreground">Hello! 👋</p>
                </div>
              </div>
              <div className="absolute top-1/4 -right-12 animate-float" style={{ animationDelay: "2s" }}>
                <div className="bg-primary/20 border border-primary/30 rounded-xl p-3 shadow-lg">
                  <p className="text-sm font-medium text-primary">Level Up!</p>
                </div>
              </div>
              <div className="absolute bottom-8 -left-16 animate-float" style={{ animationDelay: "4s" }}>
                <div className="bg-accent/20 border border-accent/30 rounded-xl p-3 shadow-lg">
                  <p className="text-sm font-medium text-accent">+500 XP</p>
                </div>
              </div>
              
              {/* Main mascot */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-75" />
                <ChameleonMascot size="xl" mood="excited" className="relative z-10 scale-150" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
