import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Check, Loader2, Save, Users } from "lucide-react";
import toast from "react-hot-toast";

import { apiFetch } from "../../lib/api";
import { cn } from "../../lib/utils";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { TopBar } from "../../components/Topbar";

interface Student {
  id: number;
  name: string;
  email: string;
  classes?: { id: number }[];
}

export function EditGroupPage() {
  const { id } = useParams(); // Получаем ID группы из URL
  const navigate = useNavigate();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    const fetchData = async () => {
      try {
        setGroupName("Group Settings");

        const studentsRes = await apiFetch("/teacher/my-students/results");
        if (!studentsRes.ok) throw new Error("Failed to load students");
        const studentsData = await studentsRes.json();

        // === ИСПРАВЛЕННЫЙ ПОИСК МАССИВА ===
        // Выводим в консоль, чтобы если что, точно увидеть структуру
        console.log("🔥 Данные студентов:", studentsData);

        let studentsList: Student[] = [];
        if (Array.isArray(studentsData)) {
          studentsList = studentsData;
        } else if (studentsData.data && Array.isArray(studentsData.data)) {
          studentsList = studentsData.data; // Если NestJS вернул { data: [...] }
        } else if (studentsData.items && Array.isArray(studentsData.items)) {
          studentsList = studentsData.items;
        } else if (
          studentsData.students &&
          Array.isArray(studentsData.students)
        ) {
          studentsList = studentsData.students;
        }

        setStudents(studentsList);

        const currentlyInGroup = studentsList
          .filter((s) => s.classes?.some((c) => c.id === Number(id)))
          .map((s) => s.id);
        setSelectedIds(new Set(currentlyInGroup));
      } catch (error) {
        toast.error("Failed to load data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void fetchData();
    }
  }, [id]);

  const toggleStudent = (studentId: number) => {
    const next = new Set(selectedIds);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      if (next.size >= 40) {
        toast.error("Maximum 40 students allowed per class");
        return;
      }
      next.add(studentId);
    }
    setSelectedIds(next);
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/teacher/classes/${id}/students`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: Array.from(selectedIds) }),
      });

      if (!res.ok) throw new Error("Failed to update group");

      toast.success("Group updated successfully!");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const name = s.name || "";
    const email = s.email || "";
    const query = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
    );
  });
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />

      <main
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <TopBar />

        <div className="max-w-5xl mx-auto px-6 w-full mt-8 pb-20 flex-1 flex flex-col">
          {/* === ШАПКА СТРАНИЦЫ === */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold leading-tight">
                  {groupName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage learners assigned to this cohort
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>

          {/* === КОНТЕНТ === */}
          <div className="bg-card border border-border rounded-[24px] shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Поиск и фильтры */}
            <div className="p-6 border-b border-border bg-card/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                <span className="text-purple-400 font-bold">
                  {selectedIds.size}
                </span>{" "}
                / 40
              </div>
            </div>

            {/* Список */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <span className="text-muted-foreground text-sm font-medium">
                    Loading roster...
                  </span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  No students found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedIds.has(student.id);
                    const initials = student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm",
                          isSelected
                            ? "bg-purple-500/10 border-purple-500/50"
                            : "bg-background border-border hover:border-purple-500/30",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 transition-colors",
                              isSelected
                                ? "bg-purple-600"
                                : "bg-muted-foreground/30",
                            )}
                          >
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-foreground leading-tight">
                              {student.name}
                            </span>
                            <span className="text-sm text-muted-foreground mt-0.5">
                              {student.email}
                            </span>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors shrink-0",
                            isSelected
                              ? "bg-purple-600 border-purple-600"
                              : "bg-transparent border-muted-foreground/30",
                          )}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
