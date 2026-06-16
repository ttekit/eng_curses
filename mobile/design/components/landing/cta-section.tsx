import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.65_0.25_295_/_0.2)_0%,_transparent_70%)]" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <ChameleonMascot size="lg" mood="waving" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-display)] mb-6 text-balance">
          Ready to Start Your{" "}
          <span className="text-primary">English Journey</span>?
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of learners who are already improving their English skills with 
          personalized video content tailored just for them.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            asChild
          >
            <Link href="/register" className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8 py-6 text-lg border-border hover:bg-muted"
            asChild
          >
            <Link href="/test">
              Take Level Test
            </Link>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required. Start learning in under 2 minutes.
        </p>
      </div>
    </section>
  )
}
