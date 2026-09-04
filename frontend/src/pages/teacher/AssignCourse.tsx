import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  BookOpen,
  Loader2,
  FileText,
  Clock,
  Trash2,
  ChevronDown,
  Users,
} from "lucide-react";

import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { TopBar } from "../../components/Topbar";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { getErrorMessage } from "../../lib/error-message";

// Импортируем модалки
import { TeacherResultsModals } from "../../components/teacher-videos/TeacherResultsModals";
import {
  EditDeadlineModal,
  type DeadlineData,
} from "../../components/teacher-videos/EditDeadlineModal";
import { AdminModal, AdminButton } from "../../components/admin/adminUi";
import { TeacherSeriesItem } from "../../components/types/teacher-videos";

export function AssignCourse() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Данные
  const [assignedSeries, setAssignedSeries] = useState<TeacherSeriesItem[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterClassId, setFilterClassId] = useState<number | "all">("all");

  // Состояния модалок
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [resultsContentId, setResultsContentId] = useState<number | null>(null);

  const [editDeadlineModalOpen, setEditDeadlineModalOpen] = useState(false);
  const [editingDeadlineId, setEditingDeadlineId] = useState<number | null>(
    null,
  );
  const [deadlineInitialData, setDeadlineInitialData] =
    useState<DeadlineData | null>(null);

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Таймер для проверки дедлайнов в реальном времени
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Делаем два стандартных запроса параллельно
      const [clsRes, assRes] = await Promise.all([
        apiFetch("/teacher/classes"),
        apiFetch("/contents/teacher/assigned-homework").catch(() => null),
      ]);

      let clsData = [];
      if (clsRes && clsRes.ok) {
        clsData = await clsRes.json();
      }

      let assData = [];
      if (assRes && assRes.ok) {
        assData = await assRes.json();
      }

      setClasses(Array.isArray(clsData) ? clsData : []);
      setAssignedSeries(Array.isArray(assData) ? assData : []);
    } catch (error) {
      toast.error("Failed to load assigned courses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    void loadData();
  }, []);

  const confirmRevokeVideo = async () => {
    if (!revokingId) return;
    setIsRevoking(true);
    try {
      const res = await apiFetch(`/contents/teacher/assign/${revokingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));

      toast.success("Assignment removed successfully");
      setRevokeModalOpen(false);

      await loadData();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to remove assignment."));
    } finally {
      setIsRevoking(false);
      setRevokingId(null);
    }
  };

  const openEditDeadlineModal = (item: TeacherSeriesItem) => {
    setEditingDeadlineId(item.contentId);
    setDeadlineInitialData({
      global: {
        availableFrom: item.availableFrom || "",
        deadline: item.deadline || "",
      },
      classes: item.classAccesses
        ? item.classAccesses.map((ca) => ({
            classId: ca.classId,
            className: ca.className,
            availableFrom: ca.availableFrom || "",
            deadline: ca.deadline || "",
          }))
        : [],
    });
    setEditDeadlineModalOpen(true);
  };

  const openResultsModal = (contentId: number) => {
    setResultsContentId(contentId);
    setResultsModalOpen(true);
  };

  // Фильтрация
  const filteredAssignedSeries = useMemo(() => {
    return assignedSeries.filter((s) => {
      if (filterClassId === "all") return true;
      return (
        s.classAccesses?.some((ca) => ca.classId === filterClassId) ||
        s.classAccesses?.length === 0
      );
    });
  }, [assignedSeries, filterClassId]);

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />

      <main
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <TopBar />

        <div className="px-6 w-full mt-8 pb-12 flex-1 flex flex-col max-w-[1400px]">
          {/* ШАПКА */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Assigned Homework</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Track assigned courses, manage deadlines, and view student test
                results.
              </p>
            </div>

            {/* ФИЛЬТР ПО КЛАССАМ */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={filterClassId}
                  onChange={(e) =>
                    setFilterClassId(
                      e.target.value === "all" ? "all" : Number(e.target.value),
                    )
                  }
                  className="appearance-none bg-card border border-border rounded-xl pl-9 pr-10 py-2.5 text-sm min-w-[220px] hover:cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:border-purple-500 font-medium shadow-sm"
                >
                  <option value="all">All Classes & Global</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ТАБЛИЦА ИЛИ ЗАГРУЗКА */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center mt-20">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
              <p className="text-muted-foreground font-medium">
                Loading assignments...
              </p>
            </div>
          ) : filteredAssignedSeries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-12 rounded-[24px] border border-dashed border-border bg-card/30">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No homework assigned
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                You haven't assigned any courses to your classes yet. Head over
                to the catalog to get started.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
                  <thead className="bg-muted/20 border-b border-border">
                    <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="p-5 font-semibold">Course / Lesson</th>
                      <th className="p-5 font-semibold">
                        Assignments & Deadlines
                      </th>
                      <th className="p-5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAssignedSeries.map((s) => {
                      const tags = [
                        ...(s.systemTags || []),
                        ...(s.userTags || []),
                      ].filter(Boolean);
                      const now = new Date(currentTime);

                      return (
                        <tr
                          key={s.contentId}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          {/* КОЛОНКА ИНФО О КУРСЕ */}
                          <td className="p-5 align-top">
                            <div className="text-foreground text-base font-bold truncate max-w-[300px]">
                              {s.name}
                            </div>
                            {tags.length > 0 && (
                              <div className="text-muted-foreground mt-1.5 text-xs truncate max-w-[300px]">
                                {tags.join(" · ")}
                              </div>
                            )}
                          </td>

                          {/* КОЛОНКА НАЗНАЧЕНИЙ И ДЕДЛАЙНОВ */}
                          <td className="p-5 align-top">
                            {s.classAccesses && s.classAccesses.length > 0 ? (
                              <details className="group/details">
                                <summary className="cursor-pointer text-xs font-bold tracking-wider text-purple-600 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 select-none transition-colors w-fit uppercase">
                                  {s.classAccesses.length === 1
                                    ? "1 Class Assigned"
                                    : `${s.classAccesses.length} Classes Assigned`}
                                  <ChevronDown className="size-3.5 transition-transform group-open/details:rotate-180" />
                                </summary>
                                <div className="mt-3 flex flex-col gap-4 pl-3 border-l-2 border-purple-500/30 py-1">
                                  {s.classAccesses.map((ca) => (
                                    <div
                                      key={ca.classId}
                                      className="flex flex-col gap-1"
                                    >
                                      <span className="text-xs font-bold uppercase text-foreground tracking-wide flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                        {ca.className}
                                      </span>
                                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-0.5">
                                        <span className="flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                          Opens:{" "}
                                          <span className="text-foreground font-medium">
                                            {ca.availableFrom
                                              ? new Date(
                                                  ca.availableFrom,
                                                ).toLocaleString("en-GB", {
                                                  dateStyle: "short",
                                                  timeStyle: "short",
                                                })
                                              : "Now"}
                                          </span>
                                        </span>
                                        <span
                                          className={cn(
                                            "flex items-center gap-1.5 font-medium",
                                            ca.deadline &&
                                              new Date(ca.deadline) < now
                                              ? "text-destructive"
                                              : "text-amber-500",
                                          )}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                          Closes:{" "}
                                          <span>
                                            {ca.deadline
                                              ? new Date(
                                                  ca.deadline,
                                                ).toLocaleString("en-GB", {
                                                  dateStyle: "short",
                                                  timeStyle: "short",
                                                })
                                              : "Never"}
                                          </span>
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-muted-foreground">
                                Global Assignment
                              </span>
                            )}
                          </td>

                          {/* КОЛОНКА ДЕЙСТВИЙ */}
                          <td className="p-5 align-top text-right">
                            <div className="inline-flex items-center justify-end gap-1 rounded-xl border border-border/50 bg-muted/20 p-1">
                              <button
                                onClick={() => openResultsModal(s.contentId)}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-purple-600 hover:shadow-sm transition-all inline-flex items-center gap-2"
                                title="View Tests"
                              >
                                <FileText className="size-4" />
                                <span className="text-xs font-semibold pr-1">
                                  Results
                                </span>
                              </button>
                              <div className="w-px h-4 bg-border mx-1"></div>
                              <button
                                onClick={() => openEditDeadlineModal(s)}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all inline-flex"
                                title="Edit Deadlines"
                              >
                                <Clock className="size-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setRevokingId(s.contentId);
                                  setRevokeModalOpen(true);
                                }}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:shadow-sm transition-all inline-flex"
                                title="Remove Assignment"
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
            </div>
          )}
        </div>

        {/* --- ИМПОРТИРОВАННЫЕ МОДАЛЬНЫЕ ОКНА --- */}
        <TeacherResultsModals
          open={resultsModalOpen}
          onClose={() => setResultsModalOpen(false)}
          contentId={resultsContentId}
        />

        <EditDeadlineModal
          open={editDeadlineModalOpen}
          onClose={() => setEditDeadlineModalOpen(false)}
          onSuccess={() => loadData(true)} // Обновляем данные (сбрасываем кэш) после изменения дедлайна
          contentId={editingDeadlineId}
          initialData={deadlineInitialData}
        />

        <AdminModal
          open={revokeModalOpen}
          onClose={() => !isRevoking && setRevokeModalOpen(false)}
          title="Remove Assignment"
          footer={
            <>
              <AdminButton
                variant="outline"
                onClick={() => setRevokeModalOpen(false)}
                disabled={isRevoking}
                className="w-full sm:w-auto"
              >
                Cancel
              </AdminButton>
              <AdminButton
                onClick={() => void confirmRevokeVideo()}
                className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
              >
                {isRevoking ? "Removing..." : "Remove Assignment"}
              </AdminButton>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this homework assignment? Students
            will no longer see it in their tasks.
          </p>
        </AdminModal>
      </main>
    </div>
  );
}
