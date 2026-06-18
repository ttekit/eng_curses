// src/components/teacher-videos/TeacherResultsModals.tsx
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { apiFetch } from "../../lib/api";
import { getErrorMessage } from "../../lib/error-message";
import { cn } from "../../lib/utils";
import { AdminModal, AdminButton } from "../admin/adminUi";

import {
  read_quiz_string,
  read_quiz_number,
  read_quiz_options,
} from "../../lib/quiz-helpers";
import { CustomSelect } from "../UI/CustomSelect";
import {
  QuizAnswerRow,
  TeacherVideoResults,
  TeacherVideoStudentResult,
} from "../types/teacher-videos";

export interface TeacherResultsModalsProps {
  open: boolean;
  contentId: number | null;
  onClose: () => void;
}

export function TeacherResultsModals({
  open,
  contentId,
  onClose,
}: TeacherResultsModalsProps) {
  const [resultsLoading, setResultsLoading] = useState(false);
  const [videoResults, setVideoResults] = useState<TeacherVideoResults | null>(
    null,
  );
  const [resultsClassFilter, setResultsClassFilter] = useState<number | "all">(
    "all",
  );

  // Стейт для второй модалки (детальный квиз студента)
  const [selectedStudentQuiz, setSelectedStudentQuiz] =
    useState<TeacherVideoStudentResult | null>(null);

  // При открытии загружаем данные
  useEffect(() => {
    if (open && contentId) {
      loadResults(contentId);
    } else {
      setVideoResults(null);
      setSelectedStudentQuiz(null);
      setResultsClassFilter("all");
    }
  }, [open, contentId]);

  const loadResults = async (id: number) => {
    setResultsLoading(true);
    try {
      const res = await apiFetch(`/contents/teacher/${id}/student-results`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const data = (await res.json()) as TeacherVideoResults;
      setVideoResults(data);
      if (data.classes?.length === 1) {
        setResultsClassFilter(data.classes[0].id);
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to load results"));
      onClose();
    } finally {
      setResultsLoading(false);
    }
  };

  const handleCloseMain = () => {
    setSelectedStudentQuiz(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* МОДАЛКА 1: Список студентов */}
      <AdminModal
        open={open && !selectedStudentQuiz}
        onClose={handleCloseMain}
        title={
          videoResults ? `Tests: ${videoResults.contentName}` : "Student Tests"
        }
        footer={
          <AdminButton onClick={handleCloseMain} className="w-full sm:w-auto">
            Close
          </AdminButton>
        }
      >
        {resultsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : videoResults ? (
          <div className="space-y-4">
            {videoResults.classes.length > 1 && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
                  Filter by Assigned Class
                </label>
                <CustomSelect
                  value={
                    resultsClassFilter === "all"
                      ? "all"
                      : String(resultsClassFilter)
                  }
                  onChange={(val) =>
                    setResultsClassFilter(val === "all" ? "all" : Number(val))
                  }
                  options={[
                    { value: "all", label: "All Assigned Classes" },
                    ...videoResults.classes.map((c) => ({
                      value: String(c.id),
                      label: c.name,
                    })),
                  ]}
                />
              </div>
            )}

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {videoResults.students
                .filter(
                  (s) =>
                    resultsClassFilter === "all" ||
                    s.classId === resultsClassFilter,
                )
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground text-sm">
                        {s.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.email}
                      </span>
                      <span className="mt-1.5 inline-flex w-fit items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                        {s.className || "General (No Class)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {s.attempt ? (
                        <>
                          <span
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border",
                              s.attempt.passed
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20",
                            )}
                          >
                            {s.attempt.passed ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <XCircle className="size-3.5" />
                            )}
                            {Math.round(s.attempt.scorePct)}%{" "}
                            {s.attempt.passed ? "PASS" : "FAIL"}
                          </span>
                          <button
                            onClick={() => setSelectedStudentQuiz(s)}
                            className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            View Answers
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide bg-muted border border-border/50 text-muted-foreground">
                          Not started
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-destructive">
            Failed to load results.
          </div>
        )}
      </AdminModal>

      {/* МОДАЛКА 2: Детальные ответы студента */}
      <AdminModal
        open={!!selectedStudentQuiz}
        onClose={() => setSelectedStudentQuiz(null)}
        title={
          selectedStudentQuiz
            ? `Test Details: ${selectedStudentQuiz.name}`
            : "Quiz Details"
        }
        footer={
          <AdminButton
            className="w-full sm:w-auto"
            onClick={() => setSelectedStudentQuiz(null)}
          >
            Back
          </AdminButton>
        }
      >
        {selectedStudentQuiz && selectedStudentQuiz.attempt && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Final Score
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold",
                    selectedStudentQuiz.attempt.passed
                      ? "text-accent"
                      : "text-destructive",
                  )}
                >
                  {Math.round(selectedStudentQuiz.attempt.scorePct)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Result
                </p>
                <p className="text-xl font-bold text-foreground">
                  {selectedStudentQuiz.attempt.correct ?? 0}{" "}
                  <span className="text-muted-foreground text-sm">
                    / {selectedStudentQuiz.attempt.total ?? 0} correct
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Student Answers
              </h4>
              {(() => {
                let rawAnswers = selectedStudentQuiz.attempt.answers;
                if (typeof rawAnswers === "string") {
                  try {
                    rawAnswers = JSON.parse(rawAnswers);
                  } catch {}
                }

                if (
                  !rawAnswers ||
                  (typeof rawAnswers !== "object" && !Array.isArray(rawAnswers))
                ) {
                  return (
                    <p className="text-sm text-muted-foreground ml-1">
                      No detailed data recorded.
                    </p>
                  );
                }

                let flatData: unknown = rawAnswers;
                const nestedAnswers = rawAnswers as Record<string, unknown>;
                if (
                  nestedAnswers.answers &&
                  typeof nestedAnswers.answers === "object" &&
                  !Array.isArray(nestedAnswers.answers)
                ) {
                  flatData = nestedAnswers.answers;
                } else if (
                  nestedAnswers.questions &&
                  typeof nestedAnswers.questions === "object" &&
                  !Array.isArray(nestedAnswers.questions)
                ) {
                  flatData = nestedAnswers.questions;
                }

                // Рендеринг массива вопросов
                if (Array.isArray(flatData)) {
                  return (
                    <div className="flex flex-col gap-4">
                      {flatData.map((entry: unknown, idx: number) => {
                        const q: QuizAnswerRow =
                          typeof entry === "object" && entry !== null
                            ? (entry as QuizAnswerRow)
                            : { text: String(entry) };
                        const qText =
                          read_quiz_string(q, ["question", "prompt"]) ||
                          `Question ${idx + 1}`;
                        const opts = read_quiz_options(q);
                        const studentChoice = read_quiz_number(q, [
                          "studentIndex",
                          "studentChoice",
                          "userAnswer",
                          "answer",
                        ]);
                        const correctChoice = read_quiz_number(q, [
                          "correctIndex",
                          "correctChoice",
                          "correctAnswer",
                          "correct",
                        ]);

                        if (opts.length === 0) {
                          const writtenAns =
                            read_quiz_string(q, [
                              "userAnswer",
                              "answer",
                              "text",
                            ]) || String(entry);
                          return (
                            <div
                              key={idx}
                              className="bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm"
                            >
                              <p className="font-semibold text-foreground mb-3 text-[15px]">
                                {qText}
                              </p>
                              <div className="bg-background/60 border border-border/50 p-4 rounded-lg">
                                <p className="text-[10px] font-bold text-primary tracking-wider mb-2 uppercase">
                                  WRITTEN ANSWER
                                </p>
                                <p className="text-sm italic text-foreground break-words leading-relaxed">
                                  "{writtenAns}"
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className="bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm"
                          >
                            <span className="text-[15px] text-foreground font-semibold break-words leading-snug">
                              {qText}
                            </span>
                            <div className="flex flex-col gap-2.5 mt-3">
                              {opts.map((opt: string, optIdx: number) => {
                                const isStudentChoice =
                                  studentChoice === optIdx;
                                const isCorrectChoice =
                                  correctChoice === optIdx;

                                let variantClass =
                                  "border-border/40 bg-background/40 text-muted-foreground";
                                let badgeClass =
                                  "bg-background border border-border/50 text-muted-foreground";

                                if (isCorrectChoice && isStudentChoice) {
                                  variantClass =
                                    "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 font-medium shadow-sm";
                                  badgeClass =
                                    "bg-green-500 text-white border-green-500";
                                } else if (isStudentChoice) {
                                  variantClass =
                                    "border-destructive/40 bg-destructive/10 text-destructive font-medium shadow-sm";
                                  badgeClass =
                                    "bg-destructive text-white border-destructive";
                                } else if (isCorrectChoice) {
                                  variantClass =
                                    "border-green-500/30 bg-background text-green-600 dark:text-green-400";
                                  badgeClass =
                                    "bg-green-500/20 text-green-600 border-green-500/30";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                                      variantClass,
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "flex items-center justify-center shrink-0 rounded-md size-6 text-[11px] font-bold",
                                        badgeClass,
                                      )}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="break-words leading-tight flex-1">
                                      {opt}
                                    </span>
                                    {isCorrectChoice && isStudentChoice && (
                                      <CheckCircle2 className="size-4 shrink-0" />
                                    )}
                                    {isStudentChoice && !isCorrectChoice && (
                                      <XCircle className="size-4 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return null;
              })()}
            </div>
          </div>
        )}
      </AdminModal>
    </>
  );
}
