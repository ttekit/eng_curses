import { 
  Video, 
  Brain, 
  Target, 
  Users, 
  Trophy, 
  BarChart3 
} from "lucide-react"

const features = [
  {
    icon: Video,
    title: "Video-Based Learning",
    description: "Learn from real-world content including movies, series, and educational videos tailored to your interests."
  },
  {
    icon: Brain,
    title: "AI Personalization",
    description: "Our intelligent system adapts to your learning pace, preferences, and areas that need improvement."
  },
  {
    icon: Target,
    title: "Focused Practice",
    description: "Interactive quizzes after each video reinforce vocabulary, grammar, and comprehension skills."
  },
  {
    icon: Users,
    title: "For Everyone",
    description: "Whether you are a student, professional, or teacher, we have tailored learning paths for you."
  },
  {
    icon: Trophy,
    title: "Gamified Progress",
    description: "Earn XP, unlock achievements, and track your journey from beginner to fluent speaker."
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Visual progress reports show your strengths and areas for growth with actionable insights."
  }
]

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_oklch(0.75_0.18_145_/_0.08)_0%,_transparent_50%)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] mb-4 text-balance">
            Why Choose <span className="text-primary">Exply</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our adaptive learning platform combines the best of entertainment and education
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
