import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { TopBar } from "../../components/Topbar";
import {
  Plus,
  MoreVertical,
  Building2,
  Users,
  Play,
  BookOpen,
  Send,
  Loader2,
  Trash2, // <-- Не забудь добавить Trash2 в импорты!
} from "lucide-react";

import { CreateClassModal } from "../../components/teacher-students/CreateClassModal";

interface GroupRecord {
  id: number;
  name: string;
  company: string;
  learnersCount: number;
  level: string;
  course: string;
  progress: number;
  themeColor: string;
  avatars: { id: number; initials: string; color: string }[];
}

export function Groups() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [classes, setClasses] = useState<GroupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // === НОВОЕ: Состояние для открытого меню (три точки) ===
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch("/teacher/classes");
      if (!res.ok) throw new Error("Failed to load classes");
      const data = await res.json();

      const colors = [
        "#a855f7",
        "#14b8a6",
        "#22c55e",
        "#f59e0b",
        "#ef4444",
        "#3b82f6",
      ];

      const mapped = data.map((c: any, index: number) => {
        const nameParts = c.name.split("—").map((p: string) => p.trim());
        const extractedLevel = nameParts[1]?.includes("B1")
          ? "Level B1"
          : "General";

        return {
          id: c.id,
          name: c.name,
          company: "My Organization",
          learnersCount: c._count?.students || 0,
          level: extractedLevel,
          course: "General English",
          progress: Math.floor(Math.random() * (100 - 10) + 10),
          themeColor: colors[index % colors.length],
          avatars: [],
        };
      });

      setClasses(mapped);
    } catch (e) {
      toast.error("Failed to load groups");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // === НОВОЕ: Функция удаления класса ===
  const handleDeleteClass = async (id: number, name: string) => {
    // Спрашиваем подтверждение перед удалением
    if (
      !window.confirm(`Are you sure you want to delete the group "${name}"?`)
    ) {
      return;
    }

    try {
      const res = await apiFetch(`/teacher/classes/${id}`, {
        method: "DELETE",
      }); // Запрос на твой бэкенд
      if (!res.ok) throw new Error("Failed to delete class");

      toast.success("Group deleted successfully!");
      setOpenDropdownId(null); // Закрываем меню
      await loadClasses(); // Перезагружаем список
    } catch (error) {
      console.error("🔥 DELETE ERROR:", error);
      toast.error("Failed to delete group");
    }
  };

  useEffect(() => {
    void loadClasses();
  }, []);

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />

      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <TopBar />

        <div className="px-6 w-full mt-8 pb-12 flex-1 flex flex-col">
          {/* ШАПКА */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Cohorts & Groups</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Group learners by team or level, then assign video courses to
                everyone at once.
              </p>
            </div>

            {classes.length > 0 && !isLoading && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Create group
              </button>
            )}
          </div>

          {/* КОНТЕНТ */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center mt-20">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
              <p className="text-muted-foreground font-medium">
                Loading your groups...
              </p>
            </div>
          ) : classes.length === 0 ? (
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 mt-8 flex flex-col items-center justify-center min-h-[500px] p-12 rounded-[24px] border-2 border-dashed border-border hover:border-purple-500/50 bg-card/30 hover:bg-purple-500/5 transition-colors cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Create your first group
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                You haven't created any cohorts yet. Group learners by team or
                level to easily assign video courses to everyone at once.
              </p>
              <button className="mt-6 px-6 py-2.5 rounded-full bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors pointer-events-none">
                Create new group
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {classes.map((group) => (
                <div
                  key={group.id}
                  className="relative flex flex-col p-6 bg-card border border-border rounded-[24px] shadow-sm hover:border-white/20 transition-colors group"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[24px] opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: group.themeColor }}
                  />

                  {/* === ОБНОВЛЕННЫЙ ЗАГОЛОВОК С МЕНЮ === */}
                  <div className="flex items-start justify-between gap-4 mt-2 relative">
                    <h3 className="font-semibold text-lg leading-tight text-foreground pr-6">
                      {group.name}
                    </h3>

                    <button
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === group.id ? null : group.id,
                        )
                      }
                      className="absolute right-0 top-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Поп-ап меню */}
                    {openDropdownId === group.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenDropdownId(null)}
                        ></div>
                        <div className="absolute right-0 top-8 z-20 w-40 flex flex-col rounded-xl border border-border bg-card p-1.5 shadow-lg">
                          {/* Здесь потом можно будет добавить кнопку Edit group */}
                          <button
                            onClick={() =>
                              handleDeleteClass(group.id, group.name)
                            }
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors w-full text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete group
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  {/* =================================== */}

                  <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
                    <Building2 className="w-4 h-4 opacity-70" />
                    <span className="text-sm">{group.company}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/20 text-xs font-medium text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {group.learnersCount} learners
                    </div>
                  </div>

                  <div className="mt-5 p-3 rounded-2xl bg-muted/30 border border-border flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-opacity-20"
                      style={{
                        backgroundColor: `${group.themeColor}33`,
                        color: group.themeColor,
                      }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">
                        Active course
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {group.course}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-xs font-medium mb-2">
                      <span className="text-muted-foreground">
                        Avg. cohort progress
                      </span>
                      <span className="text-foreground">{group.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${group.progress}%`,
                          backgroundColor: group.themeColor,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-5 flex items-center gap-3 border-t border-border mt-auto">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm font-medium">
                      <BookOpen className="w-4 h-4" />
                      Assign course
                    </button>
                    <button className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ */}
        <CreateClassModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={async () => {
            setIsCreateModalOpen(false);
            await loadClasses();
          }}
        />
      </main>
    </div>
  );
}
