import { Link } from "react-router";
import type { VideoQuizCompleteSummary } from "../../content-watch/VideoQuiz";
import { useLandingLocale } from "../../../context/LandingLocaleContext";

interface DemoQuizResultProps {
  result: VideoQuizCompleteSummary;
  onRetry: () => void;
}

export function DemoQuizResult({ result, onRetry }: DemoQuizResultProps) {
  const { messages } = useLandingLocale();
  const demo = messages.demoLessonPage;

  return (
    <div className="py-8 text-center space-y-3">
      <img src="/ResultHappy.svg" className="mx-auto w-16 h-16" alt="" />
      <p className="text-lg font-semibold text-foreground">
        {result.correctCount} / {result.totalQuestions}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {/* {demo.quizResultHint } */}
      </p>
      <div className="flex justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-muted transition-colors"
        >
          {/* {demo.tryAgain } */}
        </button>
        <Link
          to="/register"
          className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {demo.createAccount}
        </Link>
      </div>
    </div>
  );
}
