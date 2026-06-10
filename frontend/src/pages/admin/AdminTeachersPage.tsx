import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  GraduationCap,
  Mail,
  Plus,
  Search,
  Layers,
  Trash2,
  Users,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardContent,
  AdminInput,
  AdminModal,
} from "../../components/admin/adminUi";
import {
  AdminRowMenu,
  AdminRowMenuItem,
} from "../../components/admin/AdminRowMenu";
import { apiFetch } from "../../lib/api";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";

interface TeacherData {
  id: number;
  name: string;
  email: string;
  status: "active" | "pending" | "inactive";
  grades: string[];
  topics: string[];
  studentsCount: number;
  lessonsCount: number;
  classesCount: number;
  joinedDate: string;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/admin/analytics/teachers", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      } else {
        toast.error("Не удалось загрузить список преподавателей");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Ошибка сети при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTeachers();
  }, []);

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const q = query.toLowerCase();
      const matchSearch =
        t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
      const matchStatus = status === "all" || t.status === status;
      return matchSearch && matchStatus;
    });
  }, [teachers, query, status]);

  const stats = useMemo(() => {
    return {
      total: teachers.length,
      active: teachers.filter((x) => x.status === "active").length,
      students: teachers.reduce((a, x) => a + x.studentsCount, 0),
      classes: teachers.reduce((a, x) => a + x.classesCount, 0),
    };
  }, [teachers]);

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Teachers
          </h1>
          <p className="text-muted-foreground">
            Управление преподавательским составом и аудит учебных групп.
          </p>
        </div>
        <div className="flex gap-2">
          <AdminButton
            variant="outline"
            className="gap-2 rounded-[15px] px-4 hover:cursor-pointer"
            disabled={loading}
            onClick={() => void loadTeachers()}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </AdminButton>
          <AdminButton
            className="gap-2 flex rounded-[15px] bg-primary px-6 py-3 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
            onClick={() => setInviteOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add teacher
          </AdminButton>
        </div>
      </div>

      {/* Модалка добавления (инвайта) */}
      <AdminModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite teacher"
        footer={
          <>
            <AdminButton variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={() => setInviteOpen(false)}>
              Send invite
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <AdminInput placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <AdminInput type="email" placeholder="email@" />
            </div>
          </div>
        </div>
      </AdminModal>

      {/* Счётчики / Виджеты общей статистики */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.total}
              </p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.active}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.students.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </AdminCardContent>
        </AdminCard>
        <AdminCard>
          <AdminCardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Layers className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.classes}
              </p>
              <p className="text-sm text-muted-foreground">Total Classes</p>
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* Фильтры поиска */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <AdminInput
            className="pl-9"
            placeholder="Search teachers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Список карточек учителей */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-xl bg-card/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((teacher) => (
            <AdminCard key={teacher.id}>
              <AdminCardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary shrink-0">
                      {teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {teacher.email}
                      </p>
                    </div>
                  </div>
                  <AdminRowMenu>
                    <AdminRowMenuItem>
                      <Edit className="h-4 w-4" /> Edit
                    </AdminRowMenuItem>
                    <AdminRowMenuItem>
                      <Mail className="h-4 w-4" /> Email
                    </AdminRowMenuItem>
                    <AdminRowMenuItem danger>
                      <Trash2 className="h-4 w-4" /> Remove
                    </AdminRowMenuItem>
                  </AdminRowMenu>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {teacher.grades.map((g) => (
                    <AdminBadge key={g} variant="secondary">
                      {g}
                    </AdminBadge>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {teacher.topics.slice(0, 3).map((t) => (
                    <AdminBadge key={t} variant="outline">
                      {t}
                    </AdminBadge>
                  ))}
                  {teacher.topics.length > 3 ? (
                    <AdminBadge variant="outline">
                      +{teacher.topics.length - 3}
                    </AdminBadge>
                  ) : null}
                </div>

                {/* Блок Метрик (Ученики / Уроки / Классы) */}
                <div className="mt-6 grid grid-cols-3 gap-4 border-border border-t pt-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{teacher.studentsCount}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{teacher.lessonsCount}</p>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>

                  {/* Заменили рейтинг на КЛАССЫ */}
                  <div>
                    <p className="flex items-center justify-center gap-1 text-lg font-bold text-purple-400">
                      <Layers className="h-4 w-4 text-purple-400 opacity-80" />
                      {teacher.classesCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Classes</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-border border-t pt-4">
                  <AdminBadge
                    variant={
                      teacher.status === "active"
                        ? "accent"
                        : teacher.status === "pending"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {teacher.status}
                  </AdminBadge>
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(teacher.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </AdminCardContent>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Экран пустого результата */}
      {!loading && filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <GraduationCap className="mx-auto mb-2 h-10 w-10" />
          No teachers match your filters
        </div>
      ) : null}
    </div>
  );
}
