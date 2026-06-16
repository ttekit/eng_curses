import { ChameleonMascot } from "@/components/chameleon-mascot"

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Tell us about yourself - your job, hobbies, favorite genres, and learning goals.",
    mascotMood: "happy" as const
  },
  {
    number: "02", 
    title: "Take the Level Test",
    description: "A quick assessment to determine your current English proficiency level.",
    mascotMood: "thinking" as const
  },
  {
    number: "03",
    title: "Watch & Learn",
    description: "Enjoy personalized video content that matches your interests and level.",
    mascotMood: "excited" as const
  },
  {
    number: "04",
    title: "Practice & Progress",
    description: "Complete interactive quizzes and watch your skills grow over time.",
    mascotMood: "waving" as const
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] mb-4 text-balance">
            How <span className="text-primary">Exply</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and begin your personalized learning journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-border group-hover:bg-primary/50 transition-colors" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 border-2 border-border group-hover:border-primary transition-colors">
                  <ChameleonMascot size="sm" mood={step.mascotMood} animate={false} />
                </div>
                
                <span className="text-sm font-bold text-primary mb-2">
                  Step {step.number}
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
