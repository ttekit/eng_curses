import { Link } from "react-router";
import { Check, X } from "lucide-react";
import type { VideoQuizCompleteSummary } from "../../content-watch/VideoQuiz";
import { useLandingLocale } from "../../../context/LandingLocaleContext";

interface DemoQuizResultProps {
  result: VideoQuizCompleteSummary;
  onRetry: () => void;
}

export function DemoQuizResult({ result, onRetry }: DemoQuizResultProps) {
  const { messages } = useLandingLocale();
  const demo = messages.demoLessonPage;

  const hasMistakes = result.wrongReview.length > 0;

  const fallbackExplanations: Record<string, string> = {
    "Choose the correct past tense form to complete the sentence: 'Harry _____ (be) surprised when he met Ron on the train.'":
      demo.explanations.question1,
    "Which sentence correctly uses the comparative form to describe the wizarding families?":
      demo.explanations.question2,
    "Identify the correct modal verb usage: 'You ______ change into your robes before arriving at Hogwarts.'":
      demo.explanations.question3,
    "Which sentence correctly uses the past tense to describe Harry's arrival at Hogwarts?":
      demo.explanations.question4,
  };

  return (
    <div className="py-8 text-center space-y-3">
      <img src="/ResultHappy.svg" className="mx-auto w-35 h-35" alt="" />
      <p className="text-lg font-semibold text-foreground">
        {result.correctCount} / {result.totalQuestions}
      </p>
      {hasMistakes ? (
        <div className="mx-auto max-w-lg space-y-3 text-left">
          {result.wrongReview.map((item, index) => {
            const explanation =
              item.explanation ?? fallbackExplanations[item.question];

            return (
              <div
                key={index}
                className="rounded-xl border border-border bg-muted/40 p-4"
              >
                <p className="mb-2 text-sm font-medium text-foreground">
                  {item.question}
                </p>

                <div className="mb-1 flex items-start gap-2 text-sm">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span className="text-muted-foreground line-through">
                    {item.options[item.selectedIndex]}
                  </span>
                </div>

                <div className="mb-2 flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="font-medium text-foreground">
                    {item.options[item.correctIndex]}
                  </span>
                </div>

                {explanation && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {demo.allCorrect}
        </p>
      )}
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {demo.moreExpl}
      </p>
      <div className="flex justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-muted transition-colors hover:cursor-pointer"
        >
          {demo.tryAgain}
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
