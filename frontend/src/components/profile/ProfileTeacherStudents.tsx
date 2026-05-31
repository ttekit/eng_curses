import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Loader2,
  Download,
  Plus,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ProfileCard } from "./ProfileCard";
import {
  AdminButton,
  AdminModal,
  AdminInput,
} from "../../components/admin/adminUi";

export type TeacherStudentResult = {
  id: number;
  name: string;
  email: string;
  role: string;
  englishLevel: string | null;
  videosCompleted: number;
  quizAttempts: number;
  avgQuizScorePct: number | null;
  lastPlacement: {
    scorePct: number;
    englishLevel: string;
    scoreCorrect: number;
    scoreTotal: number;
    createdAt: string;
  } | null;
  recentQuizzes: {
    id: number;
    contentVideoId: number;
    videoName: string;
    correct: number;
    total: number;
    scorePct: number;
    passed: boolean;
    createdAt: string;
    answers?: any;
    summaryText?: string | null;
  }[];
};

type QuizRow = TeacherStudentResult["recentQuizzes"][0];

export function ProfileTeacherStudents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<TeacherStudentResult[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const [selectedQuiz, setSelectedQuiz] = useState<QuizRow | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [randomId, setRandomId] = useState<number>(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [newStudentCreds, setNewStudentCreds] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const loadStudents = async () => {
    try {
      const res = await apiFetch("/teacher/my-students/results", {
        method: "GET",
      });
      if (!res.ok) {
        setError(await getResponseErrorMessage(res));
        setStudents([]);
        return;
      }
      const data: unknown = await res.json();
      const list = (data as { students?: TeacherStudentResult[] }).students;
      setStudents(Array.isArray(list) ? list : []);
    } catch {
      setError("Could not load student results.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen && !isSaving) setIsModalOpen(false);
        if (deleteModalOpen && !isDeleting) setDeleteModalOpen(false);
        if (selectedQuiz) setSelectedQuiz(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen, isSaving, deleteModalOpen, isDeleting, selectedQuiz]);

  const toggleRow = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = async () => {
    try {
      const res = await apiFetch("/teacher/my-students/export", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my_students.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel file downloaded!");
    } catch (e) {
      toast.error("Failed to download Excel file");
    }
  };

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    if (!/^[A-Za-z\s-]*$/.test(value)) {
      toast.error("Please use English letters only", { id: "lang-error" });
      return;
    }

    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      const first = next.firstName.toLowerCase().replace(/[^a-z]/g, "");
      const last = next.lastName.toLowerCase().replace(/[^a-z]/g, "");
      next.email =
        first || last ? `${first}.${last}.${randomId}@explys.com` : "";
      return next;
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    const newRandom = Math.floor(1000 + Math.random() * 9000);
    setRandomId(newRandom);
    setFormData({ firstName: "", lastName: "", email: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (student: TeacherStudentResult) => {
    setEditingId(student.id);
    const parts = student.name.split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    const match = student.email.match(/\.(\d+)@/);
    const existingRandomId = match
      ? parseInt(match[1])
      : Math.floor(1000 + Math.random() * 9000);
    setRandomId(existingRandomId);

    setFormData({ firstName, lastName, email: student.email });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First and Last name are required");
      return;
    }
    setIsSaving(true);
    try {
      const url = editingId
        ? `/teacher/my-students/${editingId}`
        : "/teacher/my-students";
      const method = editingId ? "PATCH" : "POST";

      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await getResponseErrorMessage(res));

      const responseData = await res.json();

      setIsModalOpen(false);
      await loadStudents();

      if (!editingId && responseData.tempPassword) {
        setNewStudentCreds({
          email: formData.email,
          password: responseData.tempPassword,
        });
      } else {
        toast.success("Student updated!");
      }
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setDeletePhrase("");
    setDeleteModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (deletePhrase.trim().toLowerCase() !== "delete student") {
      toast.error("Incorrect phrase. Please type 'delete student'.");
      return;
    }
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const res = await apiFetch(`/teacher/my-students/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success("Student removed successfully");
      setDeleteModalOpen(false);
      await loadStudents();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>Loading student results…</p>
      </div>
    );
  }

  if (error) {
    return (
      <ProfileCard title="Student results">
        <p className="text-destructive">{error}</p>
      </ProfileCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground max-w-xl">
          Overview of learners assigned to you: completed watches, comprehension
          quizzes, and recent quiz scores per lesson.
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <AdminButton
            variant="outline"
            className="gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Download Excel
          </AdminButton>
          <AdminButton className="gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Student
          </AdminButton>
        </div>
      </div>

      <AdminModal
        open={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingId ? "Edit Student" : "Register New Student"}
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              form="add-student-form"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save Student"}
            </AdminButton>
          </>
        }
      >
        <form
          id="add-student-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (isSaving) return;
            void handleSaveStudent();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                First Name (English)
              </label>
              <AdminInput
                placeholder="e.g. John"
                value={formData.firstName}
                onChange={(e) => handleNameChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name (English)</label>
              <AdminInput
                placeholder="e.g. Doe"
                value={formData.lastName}
                onChange={(e) => handleNameChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Generated Email Address
            </label>
            <AdminInput
              type="email"
              placeholder="Auto-generated email"
              value={formData.email}
              readOnly
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            {!editingId && (
              <p className="text-xs text-muted-foreground mt-1">
                A secure random password will be generated and shown to you
                after clicking Save.
              </p>
            )}
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={!!newStudentCreds}
        onClose={() => setNewStudentCreds(null)}
        title="🎉 Student Registered!"
        footer={
          <AdminButton onClick={() => setNewStudentCreds(null)}>
            I have saved the credentials
          </AdminButton>
        }
      >
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Please copy and save these credentials now. For security reasons,{" "}
            <strong className="text-foreground">
              the password will not be shown again.
            </strong>
          </p>

          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="flex gap-2">
                <AdminInput
                  value={newStudentCreds?.email || ""}
                  readOnly
                  className="bg-background text-foreground"
                />
                <AdminButton
                  variant="outline"
                  className="px-3"
                  onClick={() => {
                    navigator.clipboard.writeText(newStudentCreds?.email || "");
                    toast.success("Email copied!");
                  }}
                  title="Copy Email"
                >
                  <Copy className="size-4" />
                </AdminButton>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Temporary Password
              </label>
              <div className="flex gap-2">
                <AdminInput
                  value={newStudentCreds?.password || ""}
                  readOnly
                  className="bg-background font-mono text-foreground font-bold"
                />
                <AdminButton
                  variant="outline"
                  className="px-3"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      newStudentCreds?.password || "",
                    );
                    toast.success("Password copied!");
                  }}
                  title="Copy Password"
                >
                  <Copy className="size-4" />
                </AdminButton>
              </div>
            </div>
          </div>

          <AdminButton
            variant="outline"
            className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10"
            onClick={() => {
              if (newStudentCreds) {
                navigator.clipboard.writeText(
                  `Email: ${newStudentCreds.email}\nPassword: ${newStudentCreds.password}`,
                );
                toast.success("Both copied to clipboard!");
              }
            }}
          >
            <Copy className="size-4" />
            Copy Both
          </AdminButton>
        </div>
      </AdminModal>

      <AdminModal
        open={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Remove Student"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </AdminButton>
            <AdminButton
              disabled={
                isDeleting ||
                deletePhrase.trim().toLowerCase() !== "delete student"
              }
              onClick={confirmDeleteStudent}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? "Removing…" : "Remove Student"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this student from your list? This
            action cannot be undone.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              To confirm, type{" "}
              <span className="font-bold text-destructive">delete student</span>{" "}
              below:
            </label>
            <AdminInput
              type="text"
              placeholder="delete student"
              value={deletePhrase}
              autoComplete="off"
              onChange={(e) => setDeletePhrase(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  deletePhrase.trim().toLowerCase() === "delete student" &&
                  !isDeleting
                ) {
                  e.preventDefault();
                  void confirmDeleteStudent();
                }
              }}
            />
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
        title={
          selectedQuiz
            ? `Quiz Details: ${selectedQuiz.videoName}`
            : "Quiz Details"
        }
        footer={
          <AdminButton onClick={() => setSelectedQuiz(null)}>Close</AdminButton>
        }
      >
        {selectedQuiz && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Final Score
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold",
                    selectedQuiz.passed ? "text-accent" : "text-destructive",
                  )}
                >
                  {Math.round(selectedQuiz.scorePct)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Result
                </p>
                <p className="text-xl font-bold text-foreground">
                  {selectedQuiz.correct}{" "}
                  <span className="text-muted-foreground text-sm">
                    / {selectedQuiz.total} correct
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Student's Inputs
              </h4>

              {(() => {
                const answers = selectedQuiz.answers;

                if (!answers || typeof answers !== "object") {
                  return selectedQuiz.summaryText ? (
                    <div className="bg-card border border-border rounded-lg p-4 mb-4">
                      <p className="text-[10px] font-bold text-primary tracking-wider mb-2">
                        WRITTEN SUMMARY
                      </p>
                      <p className="text-sm italic text-foreground">
                        "{selectedQuiz.summaryText}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No multiple-choice data saved for this attempt.
                    </p>
                  );
                }

                const baseKeys = Object.keys(answers).filter(
                  (k) => !k.includes("_"),
                );
                let renderedSummary = false;

                return (
                  <div className="flex flex-col gap-3">
                    {baseKeys.map((key) => {
                      const value = answers[key];
                      const questionText = answers[`${key}_question`];
                      const answerText = answers[`${key}_text`];
                      let optionsArray = answers[`${key}_options`];
                      const correctIndex = answers[`${key}_correct`];

                      if (typeof optionsArray === "string") {
                        try {
                          optionsArray = JSON.parse(optionsArray);
                        } catch (e) {}
                      }

                      const isWritten = typeof value === "string";
                      if (isWritten) renderedSummary = true;

                      return (
                        <div
                          key={key}
                          className="bg-muted/30 border border-border/60 rounded-lg p-4 flex flex-col gap-3"
                        >
                          <span className="text-sm text-foreground font-medium">
                            {questionText
                              ? questionText
                              : `Question ID: ${key.replace("q_", "").substring(0, 4)}...`}
                          </span>

                          {isWritten ? (
                            <div className="mt-1 rounded-md bg-background/50 border border-border/50 p-3">
                              <p className="text-[10px] font-bold text-primary tracking-wider mb-1.5">
                                WRITTEN SUMMARY
                              </p>
                              <p className="text-sm italic text-foreground">
                                "{value}"
                              </p>
                            </div>
                          ) : Array.isArray(optionsArray) ? (
                            <div className="flex flex-col gap-2 mt-1">
                              {optionsArray.map((opt, idx) => {
                                const isStudentChoice = Number(value) === idx;
                                const isCorrectChoice = correctIndex === idx;

                                let variantClass =
                                  "border-border/50 bg-background/50 text-muted-foreground";
                                let badgeClass =
                                  "bg-background border border-border/50 text-muted-foreground";
                                let statusText = null;

                                if (isCorrectChoice && isStudentChoice) {
                                  variantClass =
                                    "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 font-medium";
                                  badgeClass =
                                    "bg-green-500 text-white border-green-500";
                                  statusText = "Correct";
                                } else if (isStudentChoice) {
                                  variantClass =
                                    "border-destructive/50 bg-destructive/10 text-destructive font-medium";
                                  badgeClass =
                                    "bg-destructive text-white border-destructive";
                                  statusText = "Student's choice";
                                } else if (isCorrectChoice) {
                                  variantClass =
                                    "border-green-500/30 bg-background text-green-600 dark:text-green-400";
                                  badgeClass =
                                    "bg-green-500/20 text-green-600 border-green-500/30";
                                  statusText = "Correct answer";
                                }

                                return (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                                      variantClass,
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold",
                                        badgeClass,
                                      )}
                                    >
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span>{opt}</span>
                                    {statusText && (
                                      <span className="ml-auto text-[11px] font-semibold uppercase tracking-wider opacity-80">
                                        {statusText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-foreground bg-background border border-border px-2 py-1 rounded shrink-0">
                                Option {Number(value) + 1}
                              </span>
                              {answerText ? (
                                <span className="text-sm font-semibold text-primary/90">
                                  {String(answerText)}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">
                                  (No text saved)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {!renderedSummary && selectedQuiz.summaryText && (
                      <div className="bg-muted/30 border border-border/60 rounded-lg p-4 flex flex-col gap-3">
                        <span className="text-sm text-foreground font-medium">
                          Summary (Legacy)
                        </span>
                        <div className="mt-1 rounded-md bg-background/50 border border-border/50 p-3">
                          <p className="text-[10px] font-bold text-primary tracking-wider mb-1.5">
                            WRITTEN SUMMARY
                          </p>
                          <p className="text-sm italic text-foreground">
                            "{selectedQuiz.summaryText}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </AdminModal>

      {students.length === 0 ? (
        <ProfileCard title="Student results">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <GraduationCap className="size-12 text-muted-foreground opacity-50" />
            <p className="max-w-md text-muted-foreground">
              No students are linked to your teacher account yet. Click "Add
              Student" above to register them.
            </p>
          </div>
        </ProfileCard>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-border bg-muted/30 border-b text-muted-foreground">
                  <th className="p-3 font-medium w-10" />
                  <th className="p-3 font-medium">Student</th>
                  <th className="p-3 font-medium">Level</th>
                  <th className="p-3 text-center font-medium">Videos done</th>
                  <th className="p-3 text-center font-medium">Quizzes</th>
                  <th className="p-3 text-center font-medium">Avg score</th>
                  <th className="p-3 font-medium w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const isOpen = expanded.has(s.id);
                  return (
                    <Fragment key={s.id}>
                      <tr className="border-border/60 hover:bg-muted/20 border-b transition-colors">
                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => toggleRow(s.id)}
                            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5"
                            aria-expanded={isOpen}
                          >
                            {isOpen ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="text-foreground font-medium">
                            {s.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {s.email}
                          </div>
                        </td>
                        <td className="text-foreground p-3">
                          {s.englishLevel?.trim() || "—"}
                        </td>
                        <td className="p-3 text-center tabular-nums">
                          {s.videosCompleted}
                        </td>
                        <td className="p-3 text-center tabular-nums">
                          {s.quizAttempts}
                        </td>
                        <td className="p-3 text-center tabular-nums">
                          {s.avgQuizScorePct != null
                            ? `${s.avgQuizScorePct}%`
                            : "—"}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(s)}
                              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="Edit student"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(s.id)}
                              className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Remove student"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen ? (
                        <tr className="bg-background/50">
                          <td colSpan={7} className="p-0">
                            <div className="border-border border-t px-4 py-4">
                              <h4 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                                Recent comprehension quizzes
                              </h4>
                              {s.recentQuizzes.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                  No quiz attempts recorded yet.
                                </p>
                              ) : (
                                <ul className="space-y-3">
                                  {s.recentQuizzes.map((q) => {
                                    let writtenText = q.summaryText;
                                    if (
                                      !writtenText &&
                                      q.answers &&
                                      typeof q.answers === "object"
                                    ) {
                                      const found = Object.values(
                                        q.answers,
                                      ).find(
                                        (v) =>
                                          typeof v === "string" &&
                                          !String(v).includes("_text") &&
                                          !String(v).includes("["),
                                      );
                                      if (found) writtenText = found as string;
                                    }

                                    return (
                                      <li
                                        key={q.id}
                                        className="border-border/40 bg-card/80 flex flex-col gap-2 rounded-lg border px-4 py-3"
                                      >
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                          <div className="min-w-0 flex-1">
                                            <Link
                                              to={`/content/${q.contentVideoId}`}
                                              className="text-primary font-medium hover:underline"
                                            >
                                              {q.videoName}
                                            </Link>
                                            <div className="text-muted-foreground mt-0.5 text-xs">
                                              {new Date(
                                                q.createdAt,
                                              ).toLocaleString()}
                                            </div>
                                          </div>
                                          <div className="flex shrink-0 items-center gap-3 text-sm mt-2 sm:mt-0">
                                            <span
                                              className={cn(
                                                "font-semibold tabular-nums",
                                                q.passed
                                                  ? "text-accent"
                                                  : "text-muted-foreground",
                                              )}
                                            >
                                              {Math.round(q.scorePct)}%
                                            </span>
                                            <span className="text-muted-foreground tabular-nums">
                                              {q.correct}/{q.total}
                                            </span>
                                            <span
                                              className={cn(
                                                "rounded px-2 py-0.5 text-xs font-medium",
                                                q.passed
                                                  ? "bg-accent/15 text-accent"
                                                  : "bg-muted text-muted-foreground",
                                              )}
                                            >
                                              {q.passed ? "Passed" : "Review"}
                                            </span>
                                          </div>
                                        </div>

                                        {writtenText ? (
                                          <div className="mt-2 rounded-md bg-background/50 border border-border/50 p-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                                              Written Summary
                                            </span>
                                            <p className="text-sm text-foreground italic line-clamp-2">
                                              "{writtenText}"
                                            </p>
                                          </div>
                                        ) : null}

                                        <div className="mt-1">
                                          <button
                                            onClick={() => setSelectedQuiz(q)}
                                            className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md transition-colors"
                                          >
                                            View all answers
                                          </button>
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
