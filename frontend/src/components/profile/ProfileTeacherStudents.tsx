import { useCallback, useEffect, useState } from "react";
import {
  GraduationCap,
  Loader2,
  Download,
  Plus,
  Edit,
  Trash2,
  Users,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ProfileCard } from "./ProfileCard";
import { useAppMessages } from "../../hooks/useAppMessages";
import { AdminButton } from "../../components/admin/adminUi";

import { CreateClassModal } from "../../components/teacher-students/CreateClassModal";
import {
  EditStudentModal,
  type NewStudentCredentials,
} from "../../components/teacher-students/EditStudentModal";
import {
  ResetPasswordModal,
  NewCredentialsModal,
  DeleteStudentModal,
} from "../../components/teacher-students/StudentActionModals";
import { TeacherClass, TeacherStudentResult } from "../types/teacher-students";
import { SearchableSelect } from "../UI/SearchableSelect";

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
  const [editStudentModalOpen, setEditStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] =
    useState<TeacherStudentResult | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resetCandidate, setResetCandidate] =
    useState<TeacherStudentResult | null>(null);
  const [newStudentCreds, setNewStudentCreds] =
    useState<NewStudentCredentials | null>(null);

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
        toast.error(
          `${t.failedToLoadClasses}${await getResponseErrorMessage(resClasses)}`,
        );
      } else {
        const clsData = await resClasses.json();
        setClasses(Array.isArray(clsData) ? clsData : []);
      }
    } catch {
      setError(t.loadError);
      toast.error(t.networkError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
          <SearchableSelect
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
            searchPlaceholder={t.searchClasses}
            options={[
              { value: "all", label: t.allClasses },
              { value: "none", label: t.noClass },
              ...classes.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <AdminButton
            variant="outline"
            className="gap-2 w-full sm:w-auto justify-center"
            onClick={() => setClassModalOpen(true)}
          >
            <Users className="h-4 w-4 shrink-0" />
            {t.createClass}
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
            onClick={() => {
              setStudentToEdit(null);
              setEditStudentModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {t.addStudent}
          </AdminButton>
        </div>
      </div>

      <CreateClassModal
        open={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        onSuccess={loadData}
      />

      <EditStudentModal
        open={editStudentModalOpen}
        onClose={() => setEditStudentModalOpen(false)}
        onSuccess={async (newCreds) => {
          await loadData();
          if (newCreds) setNewStudentCreds(newCreds);
        }}
        classes={classes}
        studentToEdit={studentToEdit}
      />

      <ResetPasswordModal
        open={!!resetCandidate}
        student={resetCandidate}
        onClose={() => setResetCandidate(null)}
        onSuccess={(creds) => {
          setResetCandidate(null);
          setNewStudentCreds(creds);
        }}
      />

      <NewCredentialsModal
        creds={newStudentCreds}
        onClose={() => setNewStudentCreds(null)}
      />

      <DeleteStudentModal
        open={deleteModalOpen}
        studentId={deletingId}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={loadData}
      />

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
                <th className="p-4 font-medium w-[180px]">
                  {t.classCol || "Class"}
                </th>
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
              {filteredStudents.map((s) => (
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
                        {t.noClass}
                      </span>
                    )}
                  </td>

                  <td className="text-foreground p-4 align-middle font-medium">
                    {s.englishLevel?.trim() || (
                      <span className="text-muted-foreground text-xs">
                        {t.notStarted}
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
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all"
                        title={t.generateNewPassword}
                      >
                        <KeyRound className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          setStudentToEdit(s);
                          setEditStudentModalOpen(true);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all"
                        title={t.editStudentAria}
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(s.id);
                          setDeleteModalOpen(true);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:shadow-sm transition-all"
                        title={t.removeStudentAria}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
