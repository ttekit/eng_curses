import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import type { FeedbackKind } from "./test-session.types";

type AnswerFeedbackOverlayProps = {
  readonly feedback: FeedbackKind;
};

/**
 * Beautiful glassmorphism feedback overlay with soft glow and animated icon.
 */
export function AnswerFeedbackOverlay({ feedback }: AnswerFeedbackOverlayProps) {
  const isCorrect = feedback === "correct";
  const isWrong = feedback === "wrong";

  return (
    <AnimatePresence>
      {feedback ? (
        <motion.div
          key={feedback}
          initial={{ opacity: 0 }}
          animate={
            isWrong
              ? { opacity: 1, x: [0, -10, 10, -10, 10, 0] }
              : { opacity: 1 }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden rounded-3xl ${isCorrect ? "bg-emerald-500/10 shadow-[inset_0_0_120px_rgba(16,185,129,0.15)]" : ""
            } ${isWrong ? "bg-destructive/10 shadow-[inset_0_0_120px_rgba(239,68,68,0.15)]" : ""
            }`}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.5 }}
            className={`flex h-32 w-32 items-center justify-center rounded-full backdrop-blur-md border ${isCorrect
              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
              : "bg-destructive/20 border-destructive/50 text-destructive shadow-[0_0_40px_rgba(239,68,68,0.3)]"
              }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-16 w-16" />
            ) : (
              <XCircle className="h-16 w-16" />
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}