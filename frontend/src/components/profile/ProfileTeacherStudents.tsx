import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronRight, GraduationCap, Loader2, Download, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ProfileCard } from "./ProfileCard";
import { AdminButton, AdminModal, AdminInput } from "../../components/admin/adminUi"; 
import { AdminRowMenu, AdminRowMenuItem } from "../../components/admin/AdminRowMenu";

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
  }[];
};

export function ProfileTeacherStudents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<TeacherStudentResult[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // --- СТЕЙТЫ ДЛЯ CRM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  // Изменили стейт: теперь у нас раздельные имя и фамилия
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);

  const loadStudents = async () => {
    try {
      const res = await apiFetch("/contents/teacher/my-students/results", { method: "GET" });
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

  const toggleRow = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- ЛОГИКА CRM ---

  const handleExport = async () => {
    try {
      const res = await apiFetch("/contents/teacher/my-students/export", { method: "GET" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my_students.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel downloaded!");
    } catch (e) {
      toast.error("Failed to download Excel file");
    }
  };

  // ВАЛИДАЦИЯ И ГЕНЕРАЦИЯ EMAIL
  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    // ЖЕСТКАЯ ВАЛИДАЦИЯ: Только английские буквы, пробелы и дефисы
    if (!/^[A-Za-z\s-]*$/.test(value)) {
      toast.error("Please use English letters only", { id: "lang-error" }); // id нужен, чтобы тост не спамил
      return; 
    }

    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      
      // Генерируем email на лету только если это создание нового ученика
      if (!editingId) {
        const first = next.firstName.toLowerCase().replace(/[^a-z]/g, "");
        const last = next.lastName.toLowerCase().replace(/[^a-z]/g, "");
        // Если хоть что-то введено, собираем почту
        next.email = (first || last) ? `${first}.${last}@explys.com` : "";
      }
      return next;
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ firstName: "", lastName: "", email: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (student: TeacherStudentResult) => {
    setEditingId(student.id);
    // Разбиваем полное имя с бэкенда обратно на Имя и Фамилию
    const parts = student.name.split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

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
      const url = editingId ? `/contents/teacher/my-students/${editingId}` : "/contents/teacher/my-students";
      const method = editingId ? "PATCH" : "POST";
      
      // Склеиваем имя и фамилию для отправки на бэкенд
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
      
      toast.success(editingId ? "Student updated!" : "Student added!");
      setIsModalOpen(false);
      await loadStudents();
    } catch (e: any) {
      toast.error(e.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this student from your list?")) return;
    try {
      const res = await apiFetch(`/contents/teacher/my-students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success("Student removed");
      await loadStudents();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
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
          Overview of learners assigned to you: completed watches,
          comprehension quizzes, and recent quiz scores per lesson.
        </p>
        
        <div className="flex items-center gap-3 shrink-0">
          <AdminButton variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Download Excel
          </AdminButton>
          <AdminButton className="gap-2" onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Student
          </AdminButton>
        </div>
      </div>

      {/* --- ОБНОВЛЕННАЯ МОДАЛКА --- */}
      <AdminModal
        open={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingId ? "Edit Student" : "Register New Student"}
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </AdminButton>
            <AdminButton disabled={isSaving} onClick={() => void handleSaveStudent()}>
              {isSaving ? "Saving…" : "Save Student"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name (English)</label>
              <AdminInput
                placeholder="e.g. John"
                value={formData.firstName}
                onChange={(e) => handleNameChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name (English)</label>
              <AdminInput
                placeholder="e.g. Doe"
                value={formData.lastName}
                onChange={(e) => handleNameChange("lastName", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <AdminInput
              type="email"
              placeholder="Auto-generated email"
              value={formData.email}
              readOnly={!editingId} // Запрещаем ручной ввод при создании
              className={!editingId ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {!editingId && (
              <p className="text-xs text-muted-foreground mt-1">
                Generated automatically. The student will log in using this email.
              </p>
            )}
          </div>
        </div>
      </AdminModal>

      {/* Таблица */}
      {students.length === 0 ? (
        <ProfileCard title="Student results">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <GraduationCap className="size-12 text-muted-foreground opacity-50" />
            <p className="max-w-md text-muted-foreground">
              No students are linked to your teacher account yet. Click "Add Student" above to register them.
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
                  <th className="p-3 font-medium w-12" />
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
                            {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="text-foreground font-medium">{s.name}</div>
                          <div className="text-muted-foreground text-xs">{s.email}</div>
                        </td>
                        <td className="text-foreground p-3">{s.englishLevel?.trim() || "—"}</td>
                        <td className="p-3 text-center tabular-nums">{s.videosCompleted}</td>
                        <td className="p-3 text-center tabular-nums">{s.quizAttempts}</td>
                        <td className="p-3 text-center tabular-nums">
                          {s.avgQuizScorePct != null ? `${s.avgQuizScorePct}%` : "—"}
                        </td>
                        <td className="p-3 text-right">
                          <AdminRowMenu>
                            <AdminRowMenuItem onClick={() => openEditModal(s)}>
                              <Edit className="h-4 w-4" /> Edit
                            </AdminRowMenuItem>
                            <AdminRowMenuItem danger onClick={() => handleDeleteStudent(s.id)}>
                              <Trash2 className="h-4 w-4" /> Remove
                            </AdminRowMenuItem>
                          </AdminRowMenu>
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
                                <ul className="space-y-2">
                                  {s.recentQuizzes.map((q) => (
                                    <li
                                      key={q.id}
                                      className="border-border/40 bg-card/80 flex flex-col gap-1 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <Link
                                          to={`/content/${q.contentVideoId}`}
                                          className="text-primary font-medium hover:underline"
                                        >
                                          {q.videoName}
                                        </Link>
                                        <div className="text-muted-foreground text-xs">
                                          {new Date(q.createdAt).toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="flex shrink-0 items-center gap-3 text-sm">
                                        <span
                                          className={cn(
                                            "font-semibold tabular-nums",
                                            q.passed ? "text-accent" : "text-muted-foreground",
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
                                            q.passed ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
                                          )}
                                        >
                                          {q.passed ? "Passed" : "Review"}
                                        </span>
                                      </div>
                                    </li>
                                  ))}
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