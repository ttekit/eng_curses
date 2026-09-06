import { useCallback } from "react";
import type { FeedbackKind } from "./test-session.types";

/**
 * Haptic + motion feedback helpers for answer results.
 */
export function useAnswerFeedback() {
  const trigger_haptic = useCallback((kind: FeedbackKind) => {
    if (typeof navigator === "undefined" || !navigator.vibrate) {
      return;
    }
    if (kind === "correct") {
      navigator.vibrate(40);
      return;
    }
    if (kind === "wrong") {
      navigator.vibrate([30, 40, 30]);
    }
  }, []);

  const apply_feedback = useCallback(
    (kind: FeedbackKind) => {
      trigger_haptic(kind);
    },
    [trigger_haptic],
  );

  return { apply_feedback };
}

export function feedback_overlay_class(kind: FeedbackKind): string {
  if (kind === "correct") {
    return "bg-emerald-500/15";
  }
  if (kind === "wrong") {
    return "bg-red-500/15";
  }
  return "bg-transparent";
}
