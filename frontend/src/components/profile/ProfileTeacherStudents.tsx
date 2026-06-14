import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  GraduationCap,
  Loader2,
  Download,
  Plus,
  Edit,
  Trash2,
  Copy,
  Users,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { getErrorMessage } from "../../lib/error-message";
import { ProfileCard } from "./ProfileCard";
import { useAppMessages } from "../../hooks/useAppMessages";
import {
  AdminButton,
  AdminModal,
  AdminInput,
} from "../../components/admin/adminUi";

export type TeacherClass = {
  id: number;
  name: string;
  _count?: { students: number };
};

export type TeacherStudentResult = {
  id: number;
  name: string;
  email: string;
  role: string;
  classId: number | null;
  className: string | null;
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
};

export function ProfileTeacherStudents() {
  const t = useAppMessages().profileTeacherStudents;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<TeacherStudentResult[]>([]);

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<
    number | "all" | "none"
  >("all");
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [classNameInput, setClassNameInput] = useState("");
  const [isSavingClass, setIsSavingClass] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classId: "",
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
    isReset?: boolean;
  } | null>(null);

  const [resettingId, setResettingId] = useState<number | null>(null);
  const [resetCandidate, setResetCandidate] =
    useState<TeacherStudentResult | null>(null);

  function CustomSelect({
    value,
    onChange,
    options,
    className,
    showSearch = false,
    searchPlaceholder = "Search...",
  }: {
    value: string | number;
    onChange: (val: string | number) => void;
    options: { value: string | number; label: string }[];
    className?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && showSearch && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, showSearch]);

    const selectedLabel =
      options.find((o) => o.value === value)?.label || options[0]?.label;

    const filteredOptions = options.filter((o) =>
      String(o.label).toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
      <div ref={ref} className={cn("relative w-full", className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none",
            isOpen
              ? "border-primary ring-1 ring-primary text-foreground"
              : "border-border text-foreground hover:border-primary/50",
          )}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform text-muted-foreground",
              isOpen && "rotate-180 text-primary",
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-[99999] w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 flex flex-col">
            {showSearch && (
              <div className="border-b border-border/50 bg-muted/10 p-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="max-h-[220px] overflow-y-auto py-1 overscroll-contain">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                  No classes found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted text-left",
                        isSelected
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground font-medium",
                      )}
                    >
                      <span className="truncate block">{opt.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  const loadData = useCallback(async () => {
    try {
      const [resStudents, resClasses] = await Promise.all([
        apiFetch("/teacher/my-students/results", { method: "GET" }),
        apiFetch("/teacher/classes", { method: "GET" }),
      ]);

      if (!resStudents.ok) {
        setError(await getResponseErrorMessage(resStudents));
        setStudents([]);
        return;
      }

      const studentsData = (await resStudents.json()) as {
        students?: TeacherStudentResult[];
      };
      setStudents(
        Array.isArray(studentsData.students) ? studentsData.students : [],
      );

      if (!resClasses.ok) {
        const classErr = await getResponseErrorMessage(resClasses);
        toast.error(`Failed to load classes: ${classErr}`);
      } else {
        const clsData = await resClasses.json();
        setClasses(Array.isArray(clsData) ? clsData : []);
      }
    } catch {
      setError(t.loadError);
      toast.error("Network error while loading data");
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen && !isSaving) setIsModalOpen(false);
        if (deleteModalOpen && !isDeleting) setDeleteModalOpen(false);
        if (classModalOpen && !isSavingClass) setClassModalOpen(false);
        if (resetCandidate && !resettingId) setResetCandidate(null);
        if (newStudentCreds) setNewStudentCreds(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [
    isModalOpen,
    isSaving,
    deleteModalOpen,
    isDeleting,
    classModalOpen,
    isSavingClass,
    resetCandidate,
    resettingId,
    newStudentCreds,
  ]);

  const handleExport = async () => {
    try {
      const res = await apiFetch("/teacher/my-students/export", {
        method: "GET",
      });
      if (!res.ok) throw new Error(t.exportFailed);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my_students.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t.exportSuccess);
    } catch {
      toast.error(t.exportError);
    }
  };

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    const sanitized = value.replace(/[^A-Za-z-]/g, "");
    if (sanitized !== value) {
      toast.error(t.englishLettersOnly, { id: "lang-error" });
    }

    setFormData((prev) => {
      const next = { ...prev, [field]: sanitized };
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
    setFormData({ firstName: "", lastName: "", email: "", classId: "" });
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

    setFormData({
      firstName,
      lastName,
      email: student.email,
      classId: student.classId ? String(student.classId) : "",
    });
    setIsModalOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!resetCandidate) return;

    setResettingId(resetCandidate.id);
    try {
      const res = await apiFetch(
        `/teacher/my-students/${resetCandidate.id}/reset-password`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      const data = await res.json();

      setResetCandidate(null);

      setNewStudentCreds({
        email: resetCandidate.email,
        password: data.tempPassword,
        isReset: true,
      });
      toast.success("New password generated successfully!");
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to reset password"));
    } finally {
      setResettingId(null);
    }
  };

  const handleSaveClass = async () => {
    if (!classNameInput.trim()) return toast.error("Class name is required");
    setIsSavingClass(true);
    try {
      const res = await apiFetch("/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: classNameInput.trim() }),
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success("Class created successfully!");
      setClassModalOpen(false);
      setClassNameInput("");
      await loadData();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to create class"));
    } finally {
      setIsSavingClass(false);
    }
  };

  const handleSaveStudent = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error(t.namesRequired);
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
        classId: formData.classId ? parseInt(formData.classId) : null,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await getResponseErrorMessage(res));

      const responseData = await res.json();

      setIsModalOpen(false);
      await loadData();

      if (!editingId && responseData.tempPassword) {
        setNewStudentCreds({
          email: formData.email,
          password: responseData.tempPassword,
        });
      } else {
        toast.success(t.studentUpdated);
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, t.operationFailed));
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
    if (deletePhrase.trim().toLowerCase() !== t.deleteConfirmPhrase) {
      toast.error(t.deleteWrongPhrase);
      return;
    }
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const res = await apiFetch(`/teacher/my-students/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success(t.deleteSuccessToast);
      setDeleteModalOpen(false);
      await loadData();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, t.deleteFailed));
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (selectedClassId === "all") return true;
    if (selectedClassId === "none") return s.classId === null;
    return s.classId === selectedClassId;
  });

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <ProfileCard title={t.cardTitle}>
        <p className="text-destructive">{error}</p>
      </ProfileCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 w-full min-w-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center w-full">
        <p className="text-sm text-muted-foreground max-w-xl">{t.intro}</p>

        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 shrink-0 w-full sm:w-auto">
          <CustomSelect
            value={selectedClassId}
            onChange={(val) => {
              if (val === "all" || val === "none") {
                setSelectedClassId(val);
                return;
              }
              setSelectedClassId(
                typeof val === "number" ? val : parseInt(String(val), 10),
              );
            }}
            className="w-full xl:w-56"
            showSearch={true}
            searchPlaceholder="Search classes..."
            options={[
              { value: "all", label: "All Classes" },
              { value: "none", label: "No Class" },
              ...classes.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <AdminButton
            variant="outline"
            className="gap-2 w-full sm:w-auto justify-center"
            onClick={() => setClassModalOpen(true)}
          >
            <Users className="h-4 w-4 shrink-0" />+ Create Class
          </AdminButton>

          <AdminButton
            variant="outline"
            className="gap-2 w-full sm:w-auto justify-center border-dashed"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 shrink-0" />
            {t.downloadExcel}
          </AdminButton>

          <AdminButton
            className="gap-2 w-full sm:w-auto justify-center"
            onClick={openAddModal}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {t.addStudent}
          </AdminButton>
        </div>
      </div>

      <AdminModal
        open={classModalOpen}
        onClose={() => !isSavingClass && setClassModalOpen(false)}
        title="Create New Class"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setClassModalOpen(false)}
              disabled={isSavingClass}
            >
              Cancel
            </AdminButton>
            <AdminButton onClick={handleSaveClass} disabled={isSavingClass}>
              {isSavingClass ? "Saving..." : "Create Class"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Class Name</label>
            <AdminInput
              placeholder="e.g. Group A1 - Evening"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSaveClass();
                }
              }}
              autoFocus
            />
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingId ? t.editStudent : t.registerStudent}
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {t.cancel}
            </AdminButton>
            <AdminButton
              type="submit"
              form="add-student-form"
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? t.saving : t.saveStudent}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.firstNameLabel}</label>
              <AdminInput
                placeholder={t.firstNamePlaceholder}
                value={formData.firstName}
                className="w-full"
                onChange={(e) => handleNameChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.lastNameLabel}</label>
              <AdminInput
                placeholder={t.lastNamePlaceholder}
                value={formData.lastName}
                className="w-full"
                onChange={(e) => handleNameChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Class</label>
            <CustomSelect
              value={formData.classId}
              onChange={(val) =>
                setFormData((p) => ({ ...p, classId: String(val) }))
              }
              showSearch={true}
              searchPlaceholder="Searching for a class..."
              options={[
                { value: "", label: "No Class (General)" },
                ...classes.map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.generatedEmailLabel}
            </label>
            <AdminInput
              type="email"
              placeholder={t.generatedEmailPlaceholder}
              value={formData.email}
              readOnly
              className="bg-muted w-full text-muted-foreground cursor-not-allowed"
            />
            {!editingId && (
              <p className="text-xs text-muted-foreground mt-1">
                {t.passwordHint}
              </p>
            )}
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={!!resetCandidate}
        onClose={() => !resettingId && setResetCandidate(null)}
        title="Generate New Password"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setResetCandidate(null)}
              disabled={!!resettingId}
              className="w-full sm:w-auto"
            >
              {t.cancel}
            </AdminButton>
            <AdminButton
              disabled={!!resettingId}
              onClick={() => void confirmResetPassword()}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              {resettingId ? "Generating..." : "Generate Password"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to generate a new password for{" "}
            <strong className="font-bold">{resetCandidate?.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            The old password will stop working immediately. You will be shown
            the new password on the next screen.
          </p>
        </div>
      </AdminModal>

      <AdminModal
        open={!!newStudentCreds}
        onClose={() => setNewStudentCreds(null)}
        title={
          newStudentCreds?.isReset
            ? "🔑 New Password Generated"
            : `🎉 ${t.registeredTitle}`
        }
        footer={
          <AdminButton
            className="w-full sm:w-auto"
            onClick={() => setNewStudentCreds(null)}
          >
            {t.credentialsSaved}
          </AdminButton>
        }
      >
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {t.credentialsLead}{" "}
            <strong className="text-foreground">
              {t.credentialsPasswordNote}
            </strong>
          </p>

          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.emailAddressLabel}
              </label>
              <div className="flex gap-2">
                <AdminInput
                  value={newStudentCreds?.email || ""}
                  readOnly
                  className="bg-background text-foreground flex-1"
                />
                <AdminButton
                  variant="outline"
                  className="px-3 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(newStudentCreds?.email || "");
                    toast.success(t.emailCopied);
                  }}
                  title={t.copyEmail}
                >
                  <Copy className="size-4" />
                </AdminButton>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.tempPasswordLabel}
              </label>
              <div className="flex gap-2">
                <AdminInput
                  value={newStudentCreds?.password || ""}
                  readOnly
                  className="bg-background font-mono text-foreground font-bold flex-1"
                />
                <AdminButton
                  variant="outline"
                  className="px-3 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      newStudentCreds?.password || "",
                    );
                    toast.success(t.passwordCopied);
                  }}
                  title={t.copyPassword}
                >
                  <Copy className="size-4" />
                </AdminButton>
              </div>
            </div>
          </div>

          <AdminButton
            variant="outline"
            className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10 justify-center"
            onClick={() => {
              if (newStudentCreds) {
                navigator.clipboard.writeText(
                  `Email: ${newStudentCreds.email}\nPassword: ${newStudentCreds.password}`,
                );
                toast.success(t.bothCopied);
              }
            }}
          >
            <Copy className="size-4 shrink-0" />
            {t.copyBoth}
          </AdminButton>
        </div>
      </AdminModal>

      <AdminModal
        open={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title={t.removeStudentTitle}
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {t.cancel}
            </AdminButton>
            <AdminButton
              disabled={
                isDeleting ||
                deletePhrase.trim().toLowerCase() !== t.deleteConfirmPhrase
              }
              onClick={confirmDeleteStudent}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
            >
              {isDeleting ? t.removing : t.removeStudentCta}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.removeStudentBody}</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.deleteConfirmPrompt}{" "}
              <span className="font-bold text-destructive">
                {t.deleteConfirmPhrase}
              </span>{" "}
              below:
            </label>
            <AdminInput
              type="text"
              placeholder={t.deleteConfirmPhrase}
              value={deletePhrase}
              autoComplete="off"
              className="w-full"
              onChange={(e) => setDeletePhrase(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  deletePhrase.trim().toLowerCase() === t.deleteConfirmPhrase &&
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

      {students.length === 0 ? (
        <ProfileCard title={t.cardTitle}>
          <div className="flex flex-col items-center gap-3 py-8 text-center px-4">
            <GraduationCap className="size-12 text-muted-foreground opacity-50" />
            <p className="max-w-md text-muted-foreground">{t.emptyBody}</p>
          </div>
        </ProfileCard>
      ) : (
        <div className="w-full max-w-full overflow-auto rounded-xl border border-border/50 bg-card/50 max-h-[65vh] relative shadow-sm">
          <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 z-20 bg-card shadow-sm outline outline-1 outline-border/50">
              <tr className="text-muted-foreground">
                <th className="p-4 font-medium w-[280px]">{t.colStudent}</th>
                <th className="p-4 font-medium w-[180px]">Class</th>
                <th className="p-4 font-medium w-[120px]">{t.colLevel}</th>
                <th className="p-4 text-center font-medium w-[120px]">
                  {t.colVideosDone}
                </th>
                <th className="p-4 text-center font-medium w-[120px]">
                  {t.colQuizzes}
                </th>
                <th className="p-4 text-center font-medium w-[120px]">
                  {t.colAvgScore}
                </th>
                <th className="p-4 font-medium w-[140px] text-right">
                  {t.colActions}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                return (
                  <tr
                    key={s.id}
                    className="border-border/60 hover:bg-muted/20 border-b transition-colors"
                  >
                    <td className="p-4 align-middle">
                      <div className="text-foreground font-medium truncate w-[250px]">
                        {s.name}
                      </div>
                      <div className="text-muted-foreground text-xs truncate w-[250px]">
                        {s.email}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {s.className ? (
                        <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {s.className}
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-medium text-xs bg-muted/50 px-2.5 py-1 rounded-md border border-border/50">
                          No class
                        </span>
                      )}
                    </td>
                    <td className="text-foreground p-4 align-middle font-medium">
                      {s.englishLevel?.trim() || (
                        <span className="text-muted-foreground text-xs">
                          Not started
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center tabular-nums align-middle font-medium">
                      {s.videosCompleted}
                    </td>
                    <td className="p-4 text-center tabular-nums align-middle font-medium">
                      {s.quizAttempts}
                    </td>
                    <td className="p-4 text-center tabular-nums align-middle font-bold">
                      {s.avgQuizScorePct != null ? (
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-md inline-flex items-center justify-center min-w-[3rem]",
                            s.avgQuizScorePct >= 80
                              ? "bg-emerald-500/10 text-emerald-500"
                              : s.avgQuizScorePct >= 50
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-destructive/10 text-destructive",
                          )}
                        >
                          {s.avgQuizScorePct}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-normal">
                          —
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right align-middle">
                      <div className="inline-flex items-center justify-end gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-1">
                        <button
                          onClick={() => setResetCandidate(s)}
                          disabled={resettingId === s.id}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all disabled:opacity-50"
                          title="Generate New Password"
                        >
                          {resettingId === s.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <KeyRound className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(s)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all"
                          title={t.editStudentAria}
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(s.id)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:shadow-sm transition-all"
                          title={t.removeStudentAria}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
