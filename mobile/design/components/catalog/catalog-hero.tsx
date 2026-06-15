"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Info, Star } from "lucide-react"

export function CatalogHero() {
  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.65_0.25_295_/_0.3)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-card/60" />
      
      {/* Content */}
      <div className="relative max-w-4xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            Featured
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-accent text-accent" />
            4.9
          </span>
          <span className="text-sm text-muted-foreground">Level B2</span>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] mb-4 text-balance">
          The Office: Business Communication
        </h1>
        
        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
          Learn workplace vocabulary, professional etiquette, and casual office conversations 
          through hilarious scenes from this beloved sitcom. Perfect for intermediate learners.
        </p>
        
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
          <span>12 Episodes</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>6 hours of content</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Business English</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span>Comedy</span>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            asChild
          >
            <Link href="/watch/1">
              <Play className="w-5 h-5 mr-2 fill-current" />
              Start Watching
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 border-border hover:bg-muted"
          >
            <Info className="w-5 h-5 mr-2" />
            More Info
          </Button>
        </div>
      </div>
    </section>
  )
}
