import { useMemo } from "react";
import { cn } from "../../../lib/utils";
import { seeded_random } from "./seeded-random";

type StarfieldProps = {
  count?: number;
  className?: string;
};

/**
 * Animated twinkling star backdrop for the marketing landing page.
 */
export function Starfield({ count = 200, className }: StarfieldProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const size = 1 + seeded_random(index, 3) * 2.5;
        return {
          top: seeded_random(index, 1) * 100,
          left: seeded_random(index, 2) * 100,
          size,
          delay: seeded_random(index, 4) * 5,
          duration: 2.5 + seeded_random(index, 5) * 4,
          isBright: size > 2.2,
        };
      }),
    [count],
  );

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {stars.map((star, index) => (
        <span
          key={index}
          className={cn(
            "absolute rounded-full bg-foreground",
            star.isBright && "shadow-[0_0_6px_1px_var(--glow)]",
          )}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
