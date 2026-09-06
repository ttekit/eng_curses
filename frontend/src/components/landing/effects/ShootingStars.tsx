import { useMemo } from "react";
import { cn } from "../../../lib/utils";
import { seeded_random } from "./seeded-random";

type ShootingStarsProps = {
  count?: number;
  className?: string;
};

type StreakStyle = React.CSSProperties & {
  "--travel"?: string;
  "--angle"?: string;
};

/**
 * Occasional meteor streaks for a lively cosmic hero background.
 */
export function ShootingStars({ count = 6, className }: ShootingStarsProps) {
  const streaks = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        top: seeded_random(index, 1) * 60,
        left: seeded_random(index, 2) * 70,
        travel: 320 + seeded_random(index, 3) * 320,
        delay: seeded_random(index, 4) * 14,
        duration: 3.5 + seeded_random(index, 5) * 4,
        angle: 12 + seeded_random(index, 6) * 22,
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {streaks.map((streak, index) => {
        const style: StreakStyle = {
          top: `${streak.top}%`,
          left: `${streak.left}%`,
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklch, var(--glow) 90%, white), transparent)",
          filter: "drop-shadow(0 0 6px var(--glow))",
          "--travel": `${streak.travel}px`,
          "--angle": `${streak.angle}deg`,
          animation: `shooting ${streak.duration}s ease-in ${streak.delay}s infinite`,
        };

        return (
          <span
            key={index}
            className="absolute h-px w-[120px] rounded-full"
            style={style}
          />
        );
      })}
    </div>
  );
}
