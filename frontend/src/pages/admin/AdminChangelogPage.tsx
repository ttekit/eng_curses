import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  X,
  Save,
  Megaphone,
  Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";

interface ChangelogItem {
  id: number;
  title: string;
  content: string;
  version?: string;
  isPublished: boolean;
  createdAt: string;
  imageUrl?: string | null;
}

export default function AdminChangelogPage() {
  const [logs, setLogs] = useState<ChangelogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<ChangelogItem | null>(null);

  // Поля формы
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка списка новостей для админа (включая черновики)
  const fetchAdminLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4200/changelogs/admin/all", {
        credentials: "include", // передаем куку авторизации
      });
      if (!res.ok) throw new Error("Не удалось загрузить новости");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      toast.error("Ошибка загрузки данных");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminLogs();
  }, []);

  const handleOpenModal = (log?: ChangelogItem) => {
    if (log) {
      setEditingLog(log);
      setTitle(log.title);
      setVersion(log.version || "");
      setContent(log.content);
      setIsPublished(log.isPublished);
      setImagePreview(log.imageUrl || null);
      setImageFile(null);
    } else {
      setEditingLog(null);
      setTitle("");
      setVersion("");
      setContent("");
      setIsPublished(false);
      setImagePreview(null);
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Файл слишком большой! Максимум 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("isPublished", String(isPublished));
      if (version) formData.append("version", version);
      if (imageFile) formData.append("image", imageFile);

      let res;
      if (editingLog) {
        res = await fetch(`http://localhost:4200/changelogs/${editingLog.id}`, {
          method: "PATCH",
          body: formData,
          credentials: "include",
        });
      } else {
        res = await fetch("http://localhost:4200/changelogs", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
      }

      if (!res.ok) throw new Error("Ошибка при сохранении");

      toast.success(editingLog ? "Новость обновлена!" : "Новость создана!");
      setIsModalOpen(false);
      fetchAdminLogs();
    } catch (error) {
      toast.error("Не удалось сохранить запись");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот пост?")) return;

    try {
      const res = await fetch(`http://localhost:4200/changelogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Ошибка при удалении");

      toast.success("Новость удалена");
      setLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Не удалось удалить запись");
      console.error(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Хедер */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            What's New / Changelog
          </h1>
          <p className="text-muted-foreground mt-1">
            Публикация обновлений и новостей для пользователей
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-sm hover:cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Написать новость
        </button>
      </div>

      {/* Список */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <p className="text-muted-foreground">Пока нет ни одной записи.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-lg text-foreground">
                    {log.title}
                  </h3>
                  {log.isPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      <Eye className="h-3 w-3" /> Опубликовано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      <EyeOff className="h-3 w-3" /> Черновик
                    </span>
                  )}
                  {log.version && (
                    <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-mono text-muted-foreground">
                      {log.version}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {log.content}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(log.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>

              {/* Действия */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenModal(log)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground hover:cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold font-display text-foreground">
                {editingLog ? "Редактировать новость" : "Новая запись"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Поле загрузки фото */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Обложка новости (опционально)
                </label>

                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white hover:text-primary transition-colors text-sm font-medium"
                      >
                        Заменить
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="text-white hover:text-destructive transition-colors text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/30"
                  >
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Загрузить картинку (WebP, PNG, JPG)
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: Обновление платформы"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Версия
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Содержание
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Опишите изменения для пользователей..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      isPublished ? "bg-accent" : "bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                        isPublished ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {isPublished ? "Опубликовано" : "Сохранить как черновик"}
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground hover:cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 hover:cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Сохранить
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
