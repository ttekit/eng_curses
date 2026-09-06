import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { completeStar } from "../../lib/constellationApi";
import { GrammarLessonFlow } from "../../components/task/grammar-lesson-flow";
import { PhraseLessonFlow } from "../../components/task/phrase-lesson-flow";
import { ReadingLessonSection } from "../../components/task/reading-lesson-section";
import { StarLoadingScreen } from "../../components/task/star-loading-screen";
import { TestSessionEngine } from "../../components/test-session/TestSessionEngine";
import { build_phrase_questions } from "../../components/test-session/phrase-questions.util";
import { normalize_star_questions } from "../../components/test-session/normalize-star-questions.util";
import {
  is_star_lesson_ready,
  loading_message_for_status,
  read_content_status,
} from "../../lib/starContentStatus";
import {
  asGrammarExamples,
  asPhraseItems,
  type TaskStar,
} from "./task-page.types";

const POLL_INTERVAL_MS = 2000;

export default function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [star, setStar] = useState<TaskStar | null>(null);
  const [completing, setCompleting] = useState(false);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const pollRef = useRef<number | null>(null);

  const fetch_star = useCallback(async (): Promise<TaskStar> => {
    const res = await apiFetch(`/constellations/star/${id}`);
    if (!res.ok) {
      throw new Error("Failed to load task");
    }
    return res.json() as Promise<TaskStar>;
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    setStar(null);

    const load = async (): Promise<void> => {
      try {
        const data = await fetch_star();
        if (cancelled) {
          return;
        }
        setStar(data);
        setLoadState(is_star_lesson_ready(data) ? "ready" : "loading");
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetch_star]);

  useEffect(() => {
    if (loadState !== "loading" || !star) {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = window.setInterval(() => {
      void fetch_star()
        .then((data) => {
          setStar(data);
          if (is_star_lesson_ready(data)) {
            setLoadState("ready");
          }
        })
        .catch(() => setLoadState("error"));
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [fetch_star, loadState, star]);

  const handleComplete = async () => {
    if (!star?.id || completing) return;
    setCompleting(true);
    try {
      await completeStar(star.id);
      navigate("/watched-lessons");
    } catch {
      alert("Помилка завершення завдання");
      setCompleting(false);
    }
  };

  const phraseItems = star ? asPhraseItems(star.metadata?.phrases) : [];
  const normalizedQuestions = star
    ? normalize_star_questions(star.metadata, star.normalizedQuestions)
    : [];
  const questions =
    normalizedQuestions.length > 0
      ? normalizedQuestions
      : star?.type === "PHRASE"
        ? build_phrase_questions(phraseItems)
        : [];

  const typeLabel =
    star?.type === "GRAMMAR"
      ? "Grammar Lesson"
      : star?.type === "READING"
        ? "Reading Practice"
        : star?.type === "TEST"
          ? "Knowledge Test"
          : star?.type === "VIDEO"
            ? "Lesson"
            : "Vocabulary & Phrases";

  if (loadState === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="mb-4 text-destructive">Помилка завантаження</p>
        <button
          type="button"
          onClick={() => navigate("/watched-lessons")}
          className="text-purple-400 hover:underline"
        >
          Повернутися назад
        </button>
      </div>
    );
  }

  if (loadState !== "ready" || !star) {
    return (
      <div className="min-h-screen bg-background text-foreground antialiased">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-lg">
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
            <button
              type="button"
              onClick={() => navigate("/watched-lessons")}
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="mb-1 truncate text-xs font-bold uppercase tracking-wider text-purple-400">
                {typeLabel}
              </p>
              <h1 className="truncate font-display text-lg font-bold">
                {star?.name ?? "…"}
              </h1>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 pt-6">
          <StarLoadingScreen
            starName={star?.name}
          />
        </main>
      </div>
    );
  }

  const readyStar = star;

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate("/watched-lessons")}
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="mb-1 truncate text-xs font-bold uppercase tracking-wider text-purple-400">
              {typeLabel}
            </p>
            <h1 className="truncate font-display text-lg font-bold">
              {readyStar.name}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        {readyStar.type === "GRAMMAR" ? (
          <GrammarLessonFlow
            rule={
              typeof readyStar.metadata?.rule === "string"
                ? readyStar.metadata.rule
                : "Правило не знайдено."
            }
            examples={asGrammarExamples(readyStar.metadata?.examples)}
            questions={questions}
            completing={completing}
            onComplete={() => void handleComplete()}
          />
        ) : null}

        {readyStar.type === "READING" ? (
          <ReadingLessonSection
            text={
              typeof readyStar.metadata?.text === "string"
                ? readyStar.metadata.text
                : ""
            }
            questions={questions}
            completing={completing}
            onComplete={() => void handleComplete()}
          />
        ) : null}

        {readyStar.type === "PHRASE" ? (
          <PhraseLessonFlow
            phrases={phraseItems}
            questions={questions}
            completing={completing}
            onComplete={() => void handleComplete()}
          />
        ) : null}

        {readyStar.type === "VIDEO" ? (
          <ReadingLessonSection
            text={
              typeof readyStar.metadata?.summary === "string"
                ? readyStar.metadata.summary
                : readyStar.description ?? ""
            }
            questions={questions}
            completing={completing}
            onComplete={() => void handleComplete()}
          />
        ) : null}

        {readyStar.type === "TEST" ? (
          <TestSessionEngine
            questions={questions}
            completing={completing}
            onSessionComplete={() => void handleComplete()}
          />
        ) : null}
      </main>
    </div>
  );
}
