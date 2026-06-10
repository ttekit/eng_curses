import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Clock, Lock } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import type { QuizQuestion } from "./defaultLessonSides";

const OPEN_MIN_CHARS = 40;

function isOpenQuestion(q: QuizQuestion): boolean {
  return q.questionType === "open" || q.category === "open";
}

function sentenceCount(text: string): number {
  return text
    .trim()
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8).length;
}

function openAnswerIsValid(text: string): boolean {
  const t = text.trim();
  return t.length >= OPEN_MIN_CHARS && sentenceCount(t) >= 2;
}

export type QuizWrongReviewItem = {
  question: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  explanation?: string;
  category?: "comprehension" | "grammar" | "vocabulary" | "open";
};

export type VideoQuizCompleteSummary = {
  correctCount: number;
  totalQuestions: number;
  answersById: Record<string, number | string>;
  wrongReview: QuizWrongReviewItem[];
};

interface VideoQuizProps {
  questions: QuizQuestion[];
  isVideoComplete: boolean;
  onComplete: (summary: VideoQuizCompleteSummary) => void;
}

export function VideoQuiz({
  questions,
  isVideoComplete,
  onComplete,
}: VideoQuizProps) {
  const L = useAppMessages().lesson;
  const summary = useAppMessages().lessonSummaryPage;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [openDraft, setOpenDraft] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [answersById, setAnswersById] = useState<
    Record<string, number | string>
  >({});

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const question = questions[currentQuestion];
  const isOpen = question ? isOpenQuestion(question) : false;

  useEffect(() => {
    if (!question) return;
    setErrorMsg(null);
    if (isOpenQuestion(question)) {
      const stored = answersById[question.id];
      setOpenDraft(typeof stored === "string" ? stored : "");
    } else {
      setOpenDraft("");
    }
  }, [currentQuestion, answersById, question]);

  if (!isVideoComplete) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {L.quizLocked}
        </h3>
        <p className="text-sm text-muted-foreground">{L.quizLockedLead}</p>
      </div>
    );
  }

  function handleSubmit() {
    if (!question) return;
    setErrorMsg(null);

    let newAnswers = { ...answersById };
    let newCorrectCount = correctCount;

    // 1. Сохраняем ответ
    if (isOpen) {
      const isSkip = openDraft.trim() === "";
      if (!openAnswerIsValid(openDraft) && !isSkip) return;

      newAnswers[question.id] = openDraft.trim();
      newAnswers[`${question.id}_question`] = question.question;
    } else {
      if (selectedAnswer === null) {
        setErrorMsg(L.selectOptionError);
        return;
      }

      const answerText = question.options[selectedAnswer];
      newAnswers[question.id] = selectedAnswer;
      newAnswers[`${question.id}_text`] = answerText;
      newAnswers[`${question.id}_question`] = question.question;
      newAnswers[`${question.id}_options`] = JSON.stringify(question.options);
      newAnswers[`${question.id}_correct`] = question.correct;

      if (selectedAnswer === question.correct) {
        newCorrectCount += 1;
      }
    }

    setAnswersById(newAnswers);
    setCorrectCount(newCorrectCount);

    // 2. Мгновенно переходим к следующему вопросу ИЛИ завершаем тест
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      const wrongReview: QuizWrongReviewItem[] = [];
      for (const q of questions) {
        if (isOpenQuestion(q)) continue;
        const picked = newAnswers[q.id];
        if (typeof picked !== "number" || picked === q.correct) {
          continue;
        }
        wrongReview.push({
          question: q.question,
          options: q.options,
          selectedIndex: picked,
          correctIndex: q.correct,
          explanation: q.explanation,
          category: q.category,
        });
      }

      onComplete({
        correctCount: newCorrectCount,
        totalQuestions: questions.length,
        answersById: newAnswers,
        wrongReview,
      });
    }
  }

  const isSkip = isOpen && openDraft.trim() === "";

  const primaryDisabled = isOpen
    ? !(openAnswerIsValid(openDraft) || isSkip)
    : selectedAnswer === null;

  const categoryLabel =
    question?.category === "grammar"
      ? L.categoryGrammar
      : question?.category === "vocabulary"
        ? L.categoryVocabulary
        : question?.category === "comprehension"
          ? L.categoryComprehension
          : question?.category === "open"
            ? L.categorySummary
            : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {formatMessage(L.questionOf, {
            current: String(currentQuestion + 1),
            total: String(questions.length),
          })}
        </span>
      {/* иконки */}
        {/* <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />≈ {question?.timestamp}
        </span> */}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {categoryLabel ? (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {categoryLabel}
        </p>
      ) : null}

      <h3 className="text-lg leading-relaxed font-semibold text-foreground">
        {question?.question}
      </h3>

      {isOpen ? (
        <>
          <textarea
            value={openDraft}
            onChange={(e) => {
              setOpenDraft(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            rows={5}
            placeholder={L.openPlaceholder}
            className="focus:ring-primary/40 w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:outline-none"
          />
          <p className="text-xs text-muted-foreground">
            {formatMessage(L.openHint, { min: String(OPEN_MIN_CHARS) })}
          </p>
        </>
      ) : (
        <div className="space-y-2">
          {question?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedAnswer(index);
                  if (errorMsg) setErrorMsg(null);
                }}
                className={cn(
                  "flex w-full hover:cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm text-foreground">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {errorMsg ? (
        <div className="rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-sm text-destructive font-medium">
          {errorMsg}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={primaryDisabled}
        className={cn(
          "flex w-full rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold items-center justify-center text-foreground/70 transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]",
          primaryDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-purple-hover hover:text-white hover:cursor-pointer",
        )}
      >
        {currentQuestion < questions.length - 1 ? (
          <>
            {isSkip ? L.skipQuestion : L.nextQuestion}{" "}
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        ) : (
          L.completeLesson
        )}
      </button>
    </div>
  );
}

export function LessonCompleteBanner({ xpEarned }: { xpEarned: number }) {
  const L = useAppMessages().lesson;
  const summary = useAppMessages().lessonSummaryPage;
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/10 p-4 text-center">
      <img src="/ResultHappy.svg" className="w-20 h-20" alt="" />
      <p className="font-semibold text-foreground">{L.completeBannerTitle}</p>
      <p className="mb-3 text-sm text-muted-foreground">
        {formatMessage(L.completeBannerXp, { xp: String(xpEarned) })}
      </p>
      <Link
        to="/catalog"
        className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {summary.nextInCatalog}
      </Link>
    </div>
  );
}