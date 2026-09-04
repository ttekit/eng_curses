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
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { processCroppedImage } from "../../lib/imageOptimizer";
import { apiFetch } from "../../lib/api";
import { useLandingLocale } from "../../context/LandingLocaleContext";

interface ChangelogItem {
  id: number;
  titleUk: string;
  titleEn: string;
  contentUk: string;
  contentEn: string;
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

  const [logToDelete, setLogToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmWord, setDeleteConfirmWord] = useState("");

  const [version, setVersion] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImgSrc, setOriginalImgSrc] = useState<string>("");
  const [originalFileName, setOriginalFileName] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titleUk, setTitleUk] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentUk, setContentUk] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [editLang, setEditLang] = useState<"uk" | "en">("uk");

  const { locale } = useLandingLocale();
  const expectedWord = locale === "uk" ? "видалити" : "delete";

  const isWordValid = deleteConfirmWord.trim().toLowerCase() === expectedWord;

  const fetchAdminLogs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/changelogs/admin/all");
      if (!res.ok) throw new Error("Unable to load news");
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      toast.error("Data Loading Error");
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
      setTitleUk(log.titleUk);
      setTitleEn(log.titleEn);
      setContentUk(log.contentUk);
      setContentEn(log.contentEn);
      setVersion(log.version || "");
      setIsPublished(log.isPublished);
      setImagePreview(log.imageUrl || null);
    } else {
      setEditingLog(null);
      setTitleUk("");
      setTitleEn("");
      setContentUk("");
      setContentEn("");
      setVersion("");
      setIsPublished(false);
      setImagePreview(null);
    }
    setEditLang("uk");
    setImageFile(null);
    setIsModalOpen(true);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("The file is too large! Maximum 15MB");
      return;
    }

    setOriginalFileName(file.name);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setOriginalImgSrc(reader.result?.toString() || "");
    });
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 16 / 9, width, height),
      width,
      height,
    );
    setCrop(initialCrop);
  };

  const handleCropConfirm = async () => {
    if (imgRef.current && completedCrop?.width && completedCrop?.height) {
      try {
        const optimizedFile = await processCroppedImage(
          imgRef.current,
          completedCrop,
          originalFileName,
        );
        setImageFile(optimizedFile);
        setImagePreview(URL.createObjectURL(optimizedFile));
        setOriginalImgSrc("");
      } catch (error) {
        toast.error("Unable to crop the image");
        console.error(error);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("titleUk", titleUk);
      formData.append("titleEn", titleEn);
      formData.append("contentUk", contentUk);
      formData.append("contentEn", contentEn);
      formData.append("isPublished", String(isPublished));
      if (version) formData.append("version", version);
      if (imageFile) formData.append("image", imageFile);
      if (!imagePreview && editingLog?.imageUrl) {
        formData.append("removeImage", "true");
      }

      let res;
      if (editingLog) {
        res = await apiFetch(`/changelogs/${editingLog.id}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        res = await apiFetch("/changelogs", {
          method: "POST",
          body: formData,
        });
      }

      if (!res.ok) throw new Error("Error saving");

      toast.success(
        editingLog
          ? "This news item has been updated!"
          : "The news item has been created!",
      );
      setIsModalOpen(false);
      fetchAdminLogs();
    } catch (error) {
      toast.error("The entry could not be saved");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  
  const confirmDelete = async () => {
    if (logToDelete === null) return;

    try {
      setIsDeleting(true);
      const res = await apiFetch(`/changelogs/${logToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error during deletion");

      toast.success("The news item has been deleted");
      setLogs((prev) => prev.filter((item) => item.id !== logToDelete));
      setLogToDelete(null);
    } catch (error) {
      toast.error("Unable to delete the record");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            What's New / Changelog
          </h1>
          <p className="text-muted-foreground mt-1">
            Posting Updates and News for Users{" "}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 shadow-sm hover:cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Write a news article
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-card">
          <p className="text-muted-foreground">There are no entries yet.</p>
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
                    {log.titleUk || log.titleEn}
                  </h3>
                  {log.isPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      <Eye className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      <EyeOff className="h-3 w-3" /> Draft
                    </span>
                  )}
                  {log.version && (
                    <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-mono text-muted-foreground">
                      {log.version}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {log.contentUk || log.contentEn}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(log.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenModal(log)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLogToDelete(log.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground hover:cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold font-display text-foreground">
                {editingLog ? "Edit News Item" : "New Post"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  News Cover (optional){" "}
                </label>

                {originalImgSrc ? (
                  <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
                    <p className="text-sm font-medium text-foreground text-center">
                      Select the area (16:9)
                    </p>
                    <div className="flex justify-center overflow-auto rounded-lg bg-black/5 p-2">
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={16 / 9}
                      >
                        <img
                          ref={imgRef}
                          alt="Crop me"
                          src={originalImgSrc}
                          onLoad={onImageLoad}
                          style={{ maxHeight: "50vh", maxWidth: "100%" }}
                          className="block"
                        />
                      </ReactCrop>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setOriginalImgSrc("")}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropConfirm}
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ) : imagePreview ? (
                  <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border group">
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
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="text-white hover:text-destructive transition-colors text-sm font-medium"
                      >
                        Delete
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
                      Upload an image (WebP, PNG, JPG){" "}
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

              {/* Переключатель языка для редактирования */}
              <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setEditLang("uk")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    editLang === "uk"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  Українська
                </button>
                <button
                  type="button"
                  onClick={() => setEditLang("en")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    editLang === "en"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  English
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Title ({editLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    required
                    value={editLang === "uk" ? titleUk : titleEn}
                    onChange={(e) =>
                      editLang === "uk"
                        ? setTitleUk(e.target.value)
                        : setTitleEn(e.target.value)
                    }
                    placeholder="For example: Platform update"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {/* Инпут версии остается без изменений */}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Content ({editLang.toUpperCase()})
                </label>
                <textarea
                  rows={6}
                  required
                  value={editLang === "uk" ? contentUk : contentEn}
                  onChange={(e) =>
                    editLang === "uk"
                      ? setContentUk(e.target.value)
                      : setContentEn(e.target.value)
                  }
                  placeholder="Describe the changes for users..."
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
                    {isPublished ? "Published" : "Save as a draft"}
                  </span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 hover:cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {logToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Delete this post?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this news item? This action
                  cannot be undone.
                </p>
              </div>

              <div className="w-full text-left mt-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Type{" "}
                  <span className="font-bold text-foreground select-none">
                    {expectedWord}
                  </span>{" "}
                  to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmWord}
                  onChange={(e) => setDeleteConfirmWord(e.target.value)}
                  placeholder={expectedWord}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 w-full">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setLogToDelete(null);
                  setDeleteConfirmWord("");
                }}
                className="w-full sm:w-auto rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || !isWordValid}
                onClick={() => {
                  confirmDelete();
                  setDeleteConfirmWord("");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50 hover:cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
