import { motion, AnimatePresence } from "framer-motion";
import { feedback_overlay_class } from "./useAnswerFeedback";
import type { FeedbackKind } from "./test-session.types";

type AnswerFeedbackOverlayProps = {
  readonly feedback: FeedbackKind;
};

/**
 * Full-screen flash / shake feedback overlay.
 */
export function AnswerFeedbackOverlay({ feedback }: AnswerFeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {feedback ? (
        <motion.div
          key={feedback}
          initial={{ opacity: 0 }}
          animate={
            feedback === "wrong"
              ? { opacity: 1, x: [0, -8, 8, -6, 6, 0] }
              : { opacity: 1 }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        className={`pointer-events-none absolute inset-0 z-0 ${feedback_overlay_class(feedback)}`}
        />
      ) : null}
    </AnimatePresence>
  );
}
