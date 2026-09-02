import { Starfield } from "./Starfield";

/**
 * Fixed cosmic backdrop shared across all landing page sections.
 */
export function LandingAmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
    >
      <Starfield count={200} className="opacity-45 dark:opacity-70" />
      <div className="absolute -top-52 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[150px] dark:bg-primary/20" />
      <div className="absolute top-1/3 -right-40 h-[26rem] w-[26rem] rounded-full bg-[color-mix(in_oklch,var(--nebula)_20%,transparent)] blur-[150px]" />
      <div className="absolute bottom-0 left-0 h-[22rem] w-[22rem] rounded-full bg-accent/10 blur-[120px] dark:bg-accent/15" />
    </div>
  );
}
