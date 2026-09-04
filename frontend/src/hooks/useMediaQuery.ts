import { useEffect, useState } from "react";

const MD_MIN_WIDTH = 768;
const LG_MIN_WIDTH = 1024;

function useMinWidth(minWidth: number): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= minWidth : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [minWidth]);
  return matches;
}

/** Matches Tailwind `md` breakpoint — avoid mounting mobile carousels on desktop. */
export function useIsMdUp(): boolean {
  return useMinWidth(MD_MIN_WIDTH);
}

/** Matches Tailwind `lg` breakpoint — single layout branch so we do not mount duplicate tab panels (e.g. two quizzes). */
export function useIsLgUp(): boolean {
  return useMinWidth(LG_MIN_WIDTH);
}
