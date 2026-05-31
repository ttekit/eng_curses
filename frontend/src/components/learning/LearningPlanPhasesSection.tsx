import { useEffect, useRef } from "react";
import { BookOpen, Check } from "lucide-react";
import type { LearningPlanModel } from "../../lib/learningPlan";
import {
  DISTINCT_PASSED_LESSONS_PER_PHASE_STEP,
  arePhaseFinalTestPrerequisitesMet,
  buildPhaseTransitionChecklist,
  resolvePhaseTopicsForDisplay,
} from "../../lib/learningPlan";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { useUser } from "../../context/UserContext";
import { renderLightMarkdown } from "../../lib/renderLightMarkdown";
import { cn } from "../../lib/utils";
import { PhaseFinalTestPanel } from "./PhaseFinalTestPanel";

type Props = {
  plan: LearningPlanModel;
  /** e.g. "mb-3 flex ..." */
  headingClassName?: string;
};

export function LearningPlanPhasesSection({ plan, headingClassName }: Props) {
  const { messages } = useLandingLocale();
  const { user, refreshProfile } = useUser();
  const copy = messages.learningPlanPhases;
  const requestedTopicsRefresh = useRef(false);

  const hasAnyPhaseTopics = plan.phases.some(
    (phase) => resolvePhaseTopicsForDisplay(phase).length > 0,
  );

  useEffect(() => {
    if (
      hasAnyPhaseTopics ||
      !user?.id ||
      user.studyingPlanPhaseTopics !== undefined ||
      requestedTopicsRefresh.current
    ) {
      return;
    }
    requestedTopicsRefresh.current = true;
    void refreshProfile();
  }, [hasAnyPhaseTopics, refreshProfile, user?.id, user?.studyingPlanPhaseTopics]);

  return (
    <div>
      <h3
        className={cn(
          "mb-3 flex items-center gap-2 font-display text-lg font-semibold",
          headingClassName,
        )}
      >
        <BookOpen className="size-5 text-primary" />
        {copy.heading}
      </h3>
      <p className="mb-3 text-sm text-muted-foreground">
        {copy.intro.replace(
          "{count}",
          String(DISTINCT_PASSED_LESSONS_PER_PHASE_STEP),
        )}
      </p>
      <ol className="space-y-3">
        {plan.phases.map((phase, idx) => {
          const isActive = idx === plan.activePhaseIndex;
          const checklistItems = buildPhaseTransitionChecklist(phase, idx, plan);
          const prerequisitesComplete = arePhaseFinalTestPrerequisitesMet(checklistItems);
          const phaseTopics = resolvePhaseTopicsForDisplay(phase);
          const isLastPhase = idx >= plan.phases.length - 1;
          const hasPassedPhaseFinalTest =
            plan.phaseFinalTestPassedPhases.includes(idx);
          return (
            <li
              key={`phase-${idx}`}
              className={cn(
                "rounded-xl border bg-card/60 p-4 md:p-5",
                isActive ?
                  "border-primary/50 ring-2 ring-primary/20"
                  : "border-border opacity-90",
              )}
            >
              <div className="mb-2 flex flex-wrap items-baseline gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isActive ?
                      "bg-primary text-primary-foreground"
                      : "bg-primary/15 text-primary",
                  )}
                >
                  {idx + 1}
                </span>
                <span className="font-display font-semibold">{phase.title}</span>
                {phase.expectedLevel ?
                  <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    {copy.expectedLevel}: {phase.expectedLevel}
                  </span>
                  : null}
                {isActive ?
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {copy.activeBadge}
                  </span>
                  : null}
              </div>
              <p className="mb-3 text-sm text-muted-foreground">{phase.summary}</p>
              {phaseTopics.length > 0 ?
                <div className="mb-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    {copy.topicsToLearn}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {phaseTopics.map((topic) => (
                      <li
                        key={topic.id}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-primary/20"
                      >
                        {topic.name}
                      </li>
                    ))}
                  </ul>
                </div>
                : null}
              {checklistItems.length > 0 ?
                <div className="mb-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 md:p-3.5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300/95">
                    {copy.toAdvance}
                  </p>
                  <ul className="space-y-2 text-sm">
                    {checklistItems.map((item, i) => (
                      <li
                        key={`pass-${idx}-${i}`}
                        className={cn(
                          "flex items-start gap-2.5",
                          item.completed ?
                            "text-muted-foreground"
                            : "text-foreground/90",
                        )}
                      >
                        <span
                          role="checkbox"
                          aria-checked={item.completed}
                          aria-readonly="true"
                          className={cn(
                            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border pointer-events-none select-none",
                            item.completed ?
                              "border-emerald-600 bg-emerald-600 text-white"
                              : "border-border bg-background",
                          )}
                        >
                          {item.completed ?
                            <Check className="size-3" strokeWidth={3} aria-hidden />
                          : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          {renderLightMarkdown(item.label)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                : null}
              <PhaseFinalTestPanel
                phaseIndex={idx}
                isActivePhase={isActive}
                isLastPhase={isLastPhase}
                hasPassedPhaseFinalTest={hasPassedPhaseFinalTest}
                prerequisitesComplete={prerequisitesComplete}
              />
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {copy.suggestedFocus}
              </p>
              {phase.actions.length > 0 ?
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {phase.actions.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span
                        className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/70"
                        aria-hidden
                      />
                      {renderLightMarkdown(a)}
                    </li>
                  ))}
                </ul>
                : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
