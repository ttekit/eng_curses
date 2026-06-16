"use client"

import { GraduationCap, User, Briefcase } from "lucide-react"
import type { UserRole } from "@/app/register/page"

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void
}

const roles = [
  {
    id: "teacher" as const,
    icon: GraduationCap,
    title: "Teacher",
    description: "Create and manage learning content for your students"
  },
  {
    id: "student" as const,
    icon: User,
    title: "Student",
    description: "Learn English through personalized video lessons"
  },
  {
    id: "adult" as const,
    icon: Briefcase,
    title: "Adult Learner",
    description: "Improve your English for career or personal growth"
  }
]

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
        How will you use Exply?
      </h1>
      <p className="text-muted-foreground mb-8">
        This helps us personalize your experience
      </p>

      <div className="space-y-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <role.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{role.title}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
