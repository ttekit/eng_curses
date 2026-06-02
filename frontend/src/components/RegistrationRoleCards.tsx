import { Briefcase, GraduationCap, User } from "lucide-react";
import { cn } from "../lib/utils";
import { useLandingLocale } from "../context/LandingLocaleContext";

export type RegistrationRoleChoice = "teacher" | "student" | "adult";

interface RegistrationRoleCardsProps {
  /** Current role from context; `'choose'` means none selected visually */
  value: string;
  onChange: (role: RegistrationRoleChoice) => void;
}

const roleDefs = [
  { id: "teacher" as const, Icon: GraduationCap },
  { id: "student" as const, Icon: User },
  { id: "adult" as const, Icon: Briefcase },
];

export function RegistrationRoleCards({
  value,
  onChange,
}: RegistrationRoleCardsProps) {
  const { messages } = useLandingLocale();
  const roles = messages.auth.registration.roles;

  return (
    <div className="space-y-4">
      {roleDefs.map((role) => {
        const Icon = role.Icon;
        const selected = value === role.id;
        const copy = roles[role.id];
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={cn(
              "group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all",
              selected
                ? "border-primary bg-primary/10"
                : "hover:border-primary hover:bg-primary/5",
            )}
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Icon className="size-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">{copy.title}</h3>
              <p className="text-sm text-muted-foreground">{copy.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
