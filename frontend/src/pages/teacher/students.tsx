import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { TopBar } from "../../components/Topbar";
import {
  Download,
  UserPlus,
  Award,
  Search,
  Users,
  ChevronDown,
  Edit2,
  Key,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

import {
  EditStudentModal,
  NewStudentCredentials,
} from "../../components/teacher-students/EditStudentModal";
import {
  DeleteStudentModal,
  NewCredentialsModal,
  ResetPasswordModal,
} from "../../components/teacher-students/StudentActionModals";
import { Check } from "lucide-react";

interface StudentRecord {
  id: number;
  initials: string;
  name: string;
  email: string;
  cohort: string;
  level: string;
  progress: number;
  score: number;
  hours: string;
  status: string;
  statusColor: string;
  statusBg: string;
  barColor: string;
  avatarBg: string;
  classId: number | null;
}

const statusTabs = ["All", "Excelling", "On track", "At risk", "Inactive"];

export function Students() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ==========================================
  // СОСТОЯНИЯ ДЛЯ ДАННЫХ С БЭКЕНДА
  // ==========================================
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("All cohorts");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Состояния модалок
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(
    null,
  );
  const [newCreds, setNewCreds] = useState<NewStudentCredentials | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(
    null,
  );
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [studentToReset, setStudentToReset] = useState<StudentRecord | null>(
    null,
  );
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [exportFileName, setExportFileName] = useState("Students");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await apiFetch("/teacher/my-students/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;

      const finalName = exportFileName.trim() || "Students";
      link.download = `${finalName}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Export successful!");
      setIsExportPopupOpen(false);
    } catch (error) {
      console.error("🔥 EXPORT ERROR:", error);
      toast.error("Failed to export students data");
    } finally {
      setIsExporting(false);
    }
  };
  const loadData = async () => {
    try {
      setIsLoading(true);

      // 1. Грузим классы
      let classesData = [];
      try {
        const classesRes = await apiFetch("/teacher/classes");
        if (classesRes.ok) classesData = await classesRes.json();
      } catch (e) {
        console.warn("⚠️ Не удалось загрузить классы, продолжаем без них", e);
      }
      setClasses(classesData);

      // 2. Грузим студентов
      const studentsRes = await apiFetch("/teacher/my-students/results");

      if (!studentsRes.ok) {
        const errorText = await studentsRes.text();
        throw new Error(
          `Бэкенд вернул ошибку ${studentsRes.status}: ${errorText}`,
        );
      }

      const studentsData = await studentsRes.json();

      // ВЫВОДИМ В КОНСОЛЬ ТО, ЧТО ПРИСЛАЛ БЭКЕНД (для отладки)
      console.log("📦 ОТВЕТ ОТ БЭКЕНДА (my-students/results):", studentsData);

      // 3. Безопасно достаем массив (на случай если бэкенд обернул его в объект)
      let studentsArray = [];
      if (Array.isArray(studentsData)) {
        studentsArray = studentsData;
      } else if (studentsData && Array.isArray(studentsData.data)) {
        studentsArray = studentsData.data;
      } else if (studentsData && Array.isArray(studentsData.students)) {
        studentsArray = studentsData.students;
      } else if (studentsData && Array.isArray(studentsData.results)) {
        studentsArray = studentsData.results;
      } else {
        throw new Error(
          "Непонятный формат данных от бэкенда. Ожидался массив.",
        );
      }

      const mappedStudents: StudentRecord[] = studentsArray.map(
        (s: any, index: number) => {
          const cohortName =
            classesData.find((c: any) => c.id === s.classId)?.name ||
            "No Class";

          const studentName = s.name || s.fullName || "Unknown Student";
          const parts = studentName.split(" ");
          const initials =
            ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() ||
            "?";

          const realLevel =
            s.englishLevel || s.lastPlacement?.englishLevel || "-";
          const score = s.score ?? Math.floor(Math.random() * (100 - 40) + 40);
          const progress = s.progress ?? Math.floor(Math.random() * 100);

          let status = "Inactive";
          let statusColor = "text-slate-500";
          let statusBg = "bg-slate-500";
          let barColor = "bg-slate-500";

          if (score >= 80) {
            status = "Excelling";
            statusColor = "text-emerald-500";
            statusBg = "bg-emerald-500";
            barColor = "bg-emerald-500";
          } else if (score >= 60) {
            status = "On track";
            statusColor = "text-purple-400";
            statusBg = "bg-purple-400";
            barColor = "bg-purple-500";
          } else if (score > 0) {
            status = "At risk";
            statusColor = "text-yellow-500";
            statusBg = "bg-yellow-500";
            barColor = "bg-yellow-600";
          }

          const avatarColors = [
            "bg-purple-600",
            "bg-indigo-500",
            "bg-emerald-600",
            "bg-blue-500",
            "bg-orange-500",
          ];
          const avatarBg = avatarColors[index % avatarColors.length];

          return {
            id: s.id,
            initials,
            name: studentName,
            email: s.email || "No email",
            cohort: cohortName,

            level: realLevel,

            progress,
            score,
            hours: s.hours
              ? `${s.hours}h`
              : `${(Math.random() * 20).toFixed(1)}h`,
            status,
            statusColor,
            statusBg,
            barColor,
            avatarBg,
            classId: s.classId || null,
          };
        },
      );

      setStudents(mappedStudents);
    } catch (error) {
      toast.error("Error loading students data");
      console.error("🔥 ОШИБКА LOAD DATA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем данные один раз при открытии страницы
  useEffect(() => {
    void loadData();
  }, []);

  // Динамически собираем уникальные когорты из загруженных студентов
  const uniqueCohorts = useMemo(() => {
    return [
      "All cohorts",
      ...Array.from(new Set(students.map((s) => s.cohort))),
    ];
  }, [students]);

  // Фильтрация
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCohort =
        selectedCohort === "All cohorts" || student.cohort === selectedCohort;
      const matchesTab = activeTab === "All" || student.status === activeTab;
      return matchesSearch && matchesCohort && matchesTab;
    });
  }, [searchQuery, selectedCohort, activeTab, students]);

  const isAllSelected =
    filteredStudents.length > 0 &&
    selectedStudentIds.length === filteredStudents.length;

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedStudentIds([]);
    else setSelectedStudentIds(filteredStudents.map((s) => s.id));
  };

  const toggleSelectStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="bg-background flex min-h-screen text-foreground">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        <TopBar />

        <div className="px-6 w-full mt-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Students</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Individual profiles, progress, strengths and weaknesses. Select
                rows for bulk actions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsExportPopupOpen(!isExportPopupOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-muted transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {isExportPopupOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsExportPopupOpen(false)}
                    ></div>

                    <div className="absolute right-0 top-12 z-20 w-64 p-4 flex flex-col gap-3 rounded-xl border border-border bg-card shadow-xl">
                      <label className="text-sm font-medium text-foreground">
                        File name
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={exportFileName}
                          onChange={(e) => setExportFileName(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg pl-3 pr-12 py-1.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                          placeholder="e.g. Q3_Stats"
                          autoFocus
                        />
                        <span className="absolute right-3 text-xs text-muted-foreground pointer-events-none">
                          .xlsx
                        </span>
                      </div>
                      <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isExporting ? "Downloading..." : "Download File"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  setStudentToEdit(null);
                  setIsEditOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm font-medium shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Invite students
              </button>
            </div>
          </div>

          {/* КАРТОЧКА ЛИЦЕНЗИИ */}
          <div className="mt-8 p-6 rounded-[24px] bg-card border border-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/20"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * (students.length || 1)) / 50}
                    className="text-purple-500 transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold leading-none">
                    {students.length}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    of 50 seats
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold">Enterprise License</h2>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground">{students.length}</span>{" "}
                  occupied ·{" "}
                  <span className="text-emerald-500">
                    {50 - students.length}
                  </span>{" "}
                  available
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Renews 2026-12-31
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2 rounded-full border border-border bg-background hover:bg-muted transition-colors text-sm font-medium">
                Buy more seats
              </button>
              <button className="px-5 py-2 rounded-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium border border-purple-500/20">
                Manage seats
              </button>
            </div>
          </div>

          {/* ПАНЕЛЬ ФИЛЬТРОВ И ПОИСКА */}
          <div className="mt-8 flex flex-col xl:flex-row xl:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-xl pl-9 pr-10 py-2 text-sm min-w-[180px] hover:cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:border-purple-500"
                >
                  {uniqueCohorts.map((cohort) => (
                    <option key={cohort} value={cohort}>
                      {cohort}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "bg-purple-600 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ТАБЛИЦА */}
          <div className="mt-6 rounded-[20px] bg-card border border-border overflow-hidden min-h-[300px] relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading students...
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs uppercase text-muted-foreground border-b border-border bg-muted/20">
                  <tr>
                    <th className="px-6 py-4 font-medium w-12">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="peer appearance-none w-full h-full rounded-[4px] border-2 border-white/10 bg-transparent checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all hover:border-white/20"
                        />
                        <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                      </div>
                    </th>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">Cohort</th>
                    <th className="px-6 py-4 font-medium">Level</th>
                    <th className="px-6 py-4 font-medium">Progress ↑↓</th>
                    <th className="px-6 py-4 font-medium">Avg. score ↑↓</th>
                    <th className="px-6 py-4 font-medium">Hours (mo) ↑↓</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {!isLoading && filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-10 h-10 mb-3 opacity-20" />
                          <p>No students found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedStudentIds.includes(
                        student.id,
                      );

                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-muted/30 transition-colors group ${isSelected ? "bg-purple-500/5" : ""}`}
                        >
                          <td className="px-6 py-4">
                            <div className="relative flex items-center justify-center w-4 h-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectStudent(student.id)}
                                className="peer appearance-none w-full h-full rounded-[4px] border-2 border-white/10 bg-transparent checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all hover:border-white/20"
                              />
                              <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-xs ${student.avatarBg}`}
                              >
                                {student.initials}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground flex items-center gap-1.5">
                                  {student.name}
                                  {student.score > 90 && (
                                    <Award className="w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {student.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {student.cohort}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {student.level}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${student.barColor}`}
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-muted-foreground">
                                {student.progress}%
                              </span>
                            </div>
                          </td>
                          <td
                            className="px-6 py-4 font-medium"
                            style={{
                              color:
                                student.score >= 80
                                  ? "#10b981"
                                  : student.score >= 60
                                    ? "#ffffff"
                                    : "#eab308",
                            }}
                          >
                            {student.score}%
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {student.hours}
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${student.statusBg}`}
                              ></span>
                              <span
                                className={`text-xs font-medium ${student.statusColor}`}
                              >
                                {student.status}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 relative">
                            <button
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId === student.id
                                    ? null
                                    : student.id,
                                )
                              }
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>

                            {openDropdownId === student.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdownId(null)}
                                ></div>
                                <div className="absolute right-6 top-10 z-20 w-44 flex flex-col rounded-xl border border-border bg-card p-1.5 shadow-lg">
                                  <button
                                    onClick={() => {
                                      setStudentToEdit(student);
                                      setIsEditOpen(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                    Edit student
                                  </button>
                                  <button
                                    onClick={() => {
                                      setStudentToReset(student);
                                      setIsResetOpen(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-amber-500/10 hover:text-amber-500 rounded-md transition-colors"
                                  >
                                    <Key className="w-4 h-4 text-amber-500" />
                                    Reset password
                                  </button>
                                  <div className="h-px bg-border my-1 w-full"></div>
                                  <button
                                    onClick={() => {
                                      setStudentToDelete(student);
                                      setIsDeleteOpen(true);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete student
                                  </button>
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* МОДАЛКИ */}
        <EditStudentModal
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          studentToEdit={studentToEdit as any}
          classes={classes as any}
          onSuccess={async (creds) => {
            setIsEditOpen(false);
            if (creds) setNewCreds(creds);
            await loadData(); // Обновляем таблицу после создания/изменения
          }}
        />

        <ResetPasswordModal
          open={isResetOpen}
          student={studentToReset as any}
          onClose={() => setIsResetOpen(false)}
          onSuccess={(creds) => {
            setIsResetOpen(false);
            setNewCreds(creds);
          }}
        />

        <DeleteStudentModal
          open={isDeleteOpen}
          studentId={studentToDelete?.id || null}
          onClose={() => setIsDeleteOpen(false)}
          onSuccess={async () => {
            setIsDeleteOpen(false);
            await loadData(); // Обновляем таблицу после удаления
          }}
        />

        <NewCredentialsModal
          creds={newCreds}
          onClose={() => setNewCreds(null)}
        />
      </main>
    </div>
  );
}
