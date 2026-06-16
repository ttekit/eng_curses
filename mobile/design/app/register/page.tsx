"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChameleonMascot } from "@/components/chameleon-mascot"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RoleSelector } from "@/components/register/role-selector"
import { TeacherForm } from "@/components/register/teacher-form"
import { AdultForm } from "@/components/register/adult-form"
import { ArrowLeft, ArrowRight } from "lucide-react"

export type UserRole = "teacher" | "student" | "adult" | null

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email && formData.password && formData.name) {
      setStep(2)
    }
  }

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep(3)
  }

  const handleComplete = () => {
    // In a real app, this would submit to the backend
    router.push("/test")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ChameleonMascot size="sm" mood="waving" animate={false} />
                <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">
                  Join Exply
                </h1>
              </div>
              <p className="text-muted-foreground mb-8">
                Create your account and start your personalized learning journey
              </p>

              <form onSubmit={handleBasicSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-input border-border"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Role Selection */}
          {step === 2 && (
            <RoleSelector onSelect={handleRoleSelect} />
          )}

          {/* Step 3: Role-specific form */}
          {step === 3 && role === "teacher" && (
            <TeacherForm onComplete={handleComplete} />
          )}

          {step === 3 && (role === "student" || role === "adult") && (
            <AdultForm role={role} onComplete={handleComplete} />
          )}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-card items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.65_0.25_295_/_0.2)_0%,_transparent_70%)]" />
        
        <div className="relative text-center px-12">
          <ChameleonMascot 
            size="xl" 
            mood={step === 1 ? "waving" : step === 2 ? "thinking" : "excited"} 
            className="mx-auto mb-8 scale-150"
          />
          
          <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-4">
            {step === 1 && "Welcome to Exply!"}
            {step === 2 && "Who are you?"}
            {step === 3 && "Almost there!"}
          </h2>
          
          <p className="text-muted-foreground max-w-sm mx-auto">
            {step === 1 && "Join thousands of learners improving their English through personalized video content."}
            {step === 2 && "Tell us your role so we can customize your experience perfectly."}
            {step === 3 && "Just a few more details to personalize your learning journey."}
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s === step ? "bg-primary" : s < step ? "bg-primary/50" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
