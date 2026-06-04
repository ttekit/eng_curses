import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2, Video, Plus, Upload, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ProfileCard } from "./ProfileCard";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import {
  AdminButton,
  AdminModal,
  AdminInput,
  AdminTextarea,
  AdminSelectNative,
} from "../../components/admin/adminUi";

export type TeacherSeriesItem = {
  contentId: number;
  name: string;
  friendlyLink: string;
  visibility: string;
  contentVideoId: number | null;
  captionsReady: boolean;
  systemTags: string[];
  userTags: string[];
  processingComplexity: string | null;
  availableFrom?: string | null;
  deadline?: string | null;
};

// Автоматически делает скриншот первого кадра видео
function generateVideoThumbnailBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    video.src = URL.createObjectURL(file);
    video.onloadeddata = () => {
      video.currentTime = 0.1;
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(video.src);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas blob generation failed"));
          }
        },
        "image/jpeg",
        0.85,
      );
    };
    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      reject(e);
    };
  });
}

export function ProfileTeacherVideos() {
  const t = useAppMessages().profileTeacherVideos;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [series, setSeries] = useState<TeacherSeriesItem[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [visibilityBusyId, setVisibilityBusyId] = useState<number | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadAge, setUploadAge] = useState("0+");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Настройки продвинутых дедлайнов
  const [assignMode, setAssignMode] = useState<"all" | "classes">("all");
  const [deadlineMode, setDeadlineMode] = useState<
    "none" | "close" | "open_close"
  >("none");
  const [openDateStr, setOpenDateStr] = useState("");
  const [closeDateStr, setCloseDateStr] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<
    Record<number, { availableFrom: string; deadline: string }>
  >({});

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [resSeries, resClasses] = await Promise.all([
        apiFetch("/contents/teacher/my-series", { method: "GET" }),
        apiFetch("/teacher/classes", { method: "GET" }),
      ]);

      if (!resSeries.ok) {
        setLoadError(await getResponseErrorMessage(resSeries));
        setSeries([]);
      } else {
        const data = await resSeries.json();
        setSeries(Array.isArray(data) ? data : []);
      }

      if (resClasses.ok) {
        const clsData = await resClasses.json();
        setClasses(clsData);
      }
    } catch {
      setLoadError(t.loadError);
      setSeries([]);
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
        if (uploadOpen && !uploadSaving) setUploadOpen(false);
        if (deleteModalOpen && !isDeleting) setDeleteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [uploadOpen, uploadSaving, deleteModalOpen, isDeleting]);

  async function updateVisibility(
    contentId: number,
    next: "public" | "unlisted",
  ): Promise<void> {
    setVisibilityBusyId(contentId);
    setVisibilityError(null);
    try {
      const res = await apiFetch(`/contents/teacher/${contentId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      });
      if (!res.ok) {
        setVisibilityError(await getResponseErrorMessage(res));
        return;
      }
      const raw: unknown = await res.json();
      if (raw && typeof raw === "object" && "visibility" in raw) {
        const vis = (raw as { visibility?: unknown }).visibility;
        if (typeof vis === "string") {
          setSeries((prev) =>
            prev.map((s) =>
              s.contentId === contentId ? { ...s, visibility: vis } : s,
            ),
          );
          return;
        }
      }
      setSeries((prev) =>
        prev.map((s) =>
          s.contentId === contentId ? { ...s, visibility: next } : s,
        ),
      );
    } catch {
      setVisibilityError(t.visibilityError);
    } finally {
      setVisibilityBusyId(null);
    }
  }

  const handleUpload = async () => {
    if (uploadSaving) return;

    const name = uploadTitle.trim();
    const description = uploadDesc.trim().slice(0, 250);

    if (name.length < 2 || !uploadFile) {
      toast.error(t.titleRequired);
      return;
    }

    let finalOpen: string | null = null;
    let finalClose: string | null = null;
    let initialVisibility = "unlisted";

    if (assignMode === "all") {
      if (deadlineMode === "close") {
        if (!closeDateStr)
          return toast.error("Please select a closing date and time.");
        const cDate = new Date(closeDateStr);
        if (cDate <= new Date())
          return toast.error("The closing deadline cannot be in the past.");
        finalClose = cDate.toISOString();
        initialVisibility = "public";
      } else if (deadlineMode === "open_close") {
        if (!openDateStr || !closeDateStr)
          return toast.error("Please select both open and close dates.");
        const oDate = new Date(openDateStr);
        const cDate = new Date(closeDateStr);
        if (oDate <= new Date())
          return toast.error("The opening date must be in the future.");
        if (cDate <= oDate)
          return toast.error(
            "The closing deadline must be AFTER the opening date.",
          );
        finalOpen = oDate.toISOString();
        finalClose = cDate.toISOString();
        initialVisibility = "unlisted";
      }
    } else {
      initialVisibility = "unlisted";
      if (Object.keys(selectedClasses).length === 0) {
        return toast.error("Please select at least one class.");
      }
    }

    setUploadSaving(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("visibility", initialVisibility);
      fd.append("ageRestriction", uploadAge);
      fd.append("description", description);

      if (assignMode === "all") {
        if (finalOpen) fd.append("availableFrom", finalOpen);
        if (finalClose) fd.append("deadline", finalClose);
      } else {
        const assignments = Object.entries(selectedClasses).map(
          ([cId, data]) => ({
            classId: Number(cId),
            availableFrom: data.availableFrom
              ? new Date(data.availableFrom).toISOString()
              : undefined,
            deadline: data.deadline
              ? new Date(data.deadline).toISOString()
              : undefined,
          }),
        );
        fd.append("classAssignments", JSON.stringify(assignments));
      }

      try {
        const thumbBlob = await generateVideoThumbnailBlob(uploadFile);
        fd.append("thumbnailFile", thumbBlob, "thumbnail.jpg");
      } catch (thumbErr) {
        console.warn("Thumbnail generation failed:", thumbErr);
      }

      fd.append("file", uploadFile);

      await apiFetch("/contents/teacher/upload", {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });

      toast.success(t.uploadSuccessToast);
      setUploadOpen(false);

      // Reset form
      setUploadTitle("");
      setUploadDesc("");
      setUploadAge("0+");
      setUploadFile(null);
      setAssignMode("all");
      setDeadlineMode("none");
      setOpenDateStr("");
      setCloseDateStr("");
      setSelectedClasses({});

      await loadData();
    } catch (e: any) {
      if (e.name === "AbortError") {
        toast.error(t.uploadCancelledToast);
      } else {
        toast.error(t.uploadFailed);
      }
    } finally {
      setUploadSaving(false);
      setAbortController(null);
    }
  };

  const cancelUpload = () => {
    if (abortController) {
      abortController.abort();
      setCancelConfirmOpen(false);
      setUploadOpen(false);
      setUploadSaving(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setDeletePhrase("");
    setDeleteModalOpen(true);
  };

  const confirmDeleteVideo = async () => {
    if (deletePhrase.trim().toLowerCase() !== t.deleteConfirmPhrase) {
      toast.error(t.deleteWrongPhrase);
      return;
    }
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const res = await apiFetch(`/contents/teacher/my-series/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success(t.deleteSuccessToast);
      setDeleteModalOpen(false);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || t.deleteFailed);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>{t.loadingSeries}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <ProfileCard title={t.cardTitle}>
        <p className="text-destructive px-4 py-2">{loadError}</p>
      </ProfileCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <p className="text-sm text-muted-foreground flex-1">{t.intro}</p>
        <AdminButton
          className="gap-2 flex w-full sm:w-auto rounded-[15px] bg-primary px-6 py-3 text-sm font-semibold items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {t.uploadCta}
        </AdminButton>
      </div>

      {visibilityError ? (
        <p className="text-destructive text-sm" role="alert">
          {visibilityError}
        </p>
      ) : null}

      <AdminModal
        open={uploadOpen}
        onClose={() => !uploadSaving && setUploadOpen(false)}
        title={t.uploadModalTitle}
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() =>
                uploadSaving ? setCancelConfirmOpen(true) : setUploadOpen(false)
              }
              className="w-full sm:w-auto"
            >
              {uploadSaving ? t.cancelUpload : t.cancel}
            </AdminButton>
            <AdminButton
              type="submit"
              form="upload-lesson-form"
              disabled={uploadSaving}
              className="w-full sm:w-auto"
            >
              {uploadSaving ? t.publishing : t.publish}
            </AdminButton>
          </>
        }
      >
        <form
          id="upload-lesson-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleUpload();
          }}
        >
          <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-4 sm:p-8 text-center transition-colors hover:border-primary/50">
            <input
              type="file"
              accept="video/mp4,video/x-m4v,video/*"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <Upload className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{t.browseMp4}</p>
            <p className="mt-1 text-sm text-muted-foreground break-words">
              {uploadFile ? uploadFile.name : t.uploadHint}
            </p>
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.lessonTitleLabel}</label>
            <AdminInput
              placeholder={t.titleExample}
              value={uploadTitle}
              className="w-full"
              onChange={(e) => setUploadTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Age Restriction</label>
              <AdminSelectNative
                value={uploadAge}
                onChange={(e) => setUploadAge(e.target.value)}
                className="w-full"
              >
                <option value="0+">0+</option>
                <option value="12+">12+</option>
                <option value="16+">16+</option>
                <option value="18+">18+</option>
                <option value="21+">21+</option>
              </AdminSelectNative>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.descriptionOptional}
            </label>
            <AdminTextarea
              placeholder={t.descriptionPlaceholder}
              value={uploadDesc}
              className="w-full"
              onChange={(e) => setUploadDesc(e.target.value)}
              maxLength={250}
            />
          </div>

          <div className="space-y-4 pt-4 mt-2 border-t border-border/50">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary">
                Assign To
              </label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
                value={assignMode}
                onChange={(e) => setAssignMode(e.target.value as any)}
              >
                <option value="all">All my students (Глобально всем)</option>
                <option value="classes">
                  Specific classes (Продвинутые дедлайны по группам)
                </option>
              </select>
            </div>

            {assignMode === "all" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 bg-muted/20 p-4 rounded-lg border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Global Visibility Rules
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    value={deadlineMode}
                    onChange={(e) => setDeadlineMode(e.target.value as any)}
                  >
                    <option value="none">
                      Manual start/stop (Starts Private)
                    </option>
                    <option value="close">
                      Has closing deadline (Starts Public)
                    </option>
                    <option value="open_close">
                      Schedule open & close dates (Starts Private)
                    </option>
                  </select>
                </div>

                {deadlineMode === "open_close" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Opening Date (Becomes Public)
                    </label>
                    <AdminInput
                      type="datetime-local"
                      value={openDateStr}
                      className="w-full"
                      max="9999-12-31T23:59"
                      onChange={(e) => setOpenDateStr(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                )}

                {(deadlineMode === "close" ||
                  deadlineMode === "open_close") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Closing Deadline (Becomes Private)
                    </label>
                    <AdminInput
                      type="datetime-local"
                      value={closeDateStr}
                      className="w-full"
                      max="9999-12-31T23:59"
                      onChange={(e) => setCloseDateStr(e.target.value)}
                      min={
                        deadlineMode === "open_close" && openDateStr
                          ? openDateStr
                          : new Date().toISOString().slice(0, 16)
                      }
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {assignMode === "classes" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1 bg-muted/20 p-4 rounded-lg border border-border">
                <label className="text-sm font-medium text-foreground">
                  Select classes and set personal deadlines:
                </label>
                {classes.length === 0 ? (
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border/50">
                    You haven't created any classes yet. Go to the "Students"
                    tab to create one.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {classes.map((cls) => {
                      const isSelected = !!selectedClasses[cls.id];
                      const data = selectedClasses[cls.id] || {
                        availableFrom: "",
                        deadline: "",
                      };
                      return (
                        <div
                          key={cls.id}
                          className={cn(
                            "border border-border/70 rounded-lg p-3 space-y-3 transition-colors",
                            isSelected
                              ? "bg-primary/5 border-primary/30"
                              : "bg-background",
                          )}
                        >
                          <label className="flex items-center gap-3 font-semibold cursor-pointer text-sm select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClasses((p) => ({
                                    ...p,
                                    [cls.id]: {
                                      availableFrom: "",
                                      deadline: "",
                                    },
                                  }));
                                } else {
                                  const next = { ...selectedClasses };
                                  delete next[cls.id];
                                  setSelectedClasses(next);
                                }
                              }}
                              className="rounded border-border text-primary focus:ring-primary size-4.5 cursor-pointer"
                            />
                            {cls.name}
                          </label>

                          {isSelected && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8 pt-1">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Open Date (Optional)
                                </label>
                                <AdminInput
                                  type="datetime-local"
                                  value={data.availableFrom}
                                  onChange={(e) =>
                                    setSelectedClasses((p) => ({
                                      ...p,
                                      [cls.id]: {
                                        ...p[cls.id],
                                        availableFrom: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Deadline (Optional)
                                </label>
                                <AdminInput
                                  type="datetime-local"
                                  value={data.deadline}
                                  onChange={(e) =>
                                    setSelectedClasses((p) => ({
                                      ...p,
                                      [cls.id]: {
                                        ...p[cls.id],
                                        deadline: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        title={t.cancelUploadTitle}
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setCancelConfirmOpen(false)}
              className="w-full sm:w-auto"
            >
              {t.cancelUploadNo}
            </AdminButton>
            <AdminButton
              variant="danger"
              className="w-full sm:w-auto"
              onClick={cancelUpload}
            >
              {t.cancelUploadYes}
            </AdminButton>
          </>
        }
      >
        <p>{t.cancelUploadBody}</p>
      </AdminModal>

      <AdminModal
        open={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title={t.deleteVideoTitle}
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
              onClick={confirmDeleteVideo}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
            >
              {isDeleting ? t.deleting : t.deleteVideoCta}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t.deleteVideoBody}</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t.deleteConfirmPrompt}{" "}
              <span className="font-black text-destructive text-base">
                {t.deleteConfirmPhrase}
              </span>{" "}
              below:
            </label>
            <AdminInput
              type="text"
              placeholder={t.deleteConfirmPhrase}
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              autoComplete="off"
              className="w-full"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  deletePhrase.trim().toLowerCase() === t.deleteConfirmPhrase &&
                  !isDeleting
                ) {
                  e.preventDefault();
                  void confirmDeleteVideo();
                }
              }}
            />
          </div>
        </div>
      </AdminModal>

      {series.length === 0 ? (
        <ProfileCard title={t.cardTitle}>
          <div className="flex flex-col items-center gap-3 py-8 text-center px-4">
            <Video className="size-12 text-muted-foreground opacity-50" />
            <p className="max-w-md text-muted-foreground">{t.emptyBody}</p>
          </div>
        </ProfileCard>
      ) : (
        <div
          className="w-full rounded-xl border border-border/50 bg-card/50 shadow-sm"
          style={{ maxWidth: "100%", overflow: "hidden" }}
        >
          <div
            style={{
              overflowX: "auto",
              width: "100%",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <table
              className="text-left text-sm"
              style={{ minWidth: "900px", width: "100%", whiteSpace: "nowrap" }}
            >
              <thead>
                <tr className="border-border bg-muted/30 border-b text-muted-foreground">
                  <th className="p-4 font-semibold text-sm">{t.colSeries}</th>
                  <th className="p-4 font-semibold text-sm">{t.colCaptions}</th>
                  <th className="p-4 font-semibold text-sm">{t.colCatalog}</th>
                  <th className="p-4 font-semibold text-sm">{t.colOpen}</th>
                  <th className="p-4 font-semibold text-sm text-right">
                    {t.colActions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => {
                  const busy = visibilityBusyId === s.contentId;
                  const vis = s.visibility.trim().toLowerCase();
                  const isPublic = vis === "public";
                  const tags = [...s.systemTags, ...s.userTags].filter(Boolean);

                  return (
                    <tr
                      key={s.contentId}
                      className="border-border/60 hover:bg-muted/10 border-b last:border-0 transition-colors"
                    >
                      <td className="p-4 align-middle">
                        <div
                          className="text-foreground text-base font-bold truncate"
                          style={{
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {s.name}
                        </div>

                        {(s.availableFrom || s.deadline) && (
                          <div className="mt-1.5 flex flex-col gap-0.5 text-xs font-medium">
                            {s.availableFrom && (
                              <span
                                className={
                                  new Date(s.availableFrom) > new Date()
                                    ? "text-blue-500"
                                    : "text-muted-foreground"
                                }
                              >
                                Opens:{" "}
                                {new Date(s.availableFrom).toLocaleString([], {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            )}
                            {s.deadline && (
                              <span
                                className={
                                  new Date(s.deadline) < new Date()
                                    ? "text-destructive"
                                    : "text-amber-500"
                                }
                              >
                                Closes:{" "}
                                {new Date(s.deadline).toLocaleString([], {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </span>
                            )}
                          </div>
                        )}

                        {s.processingComplexity ? (
                          <div
                            className="text-muted-foreground mt-1 text-xs truncate"
                            style={{
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {t.processingPrefix} {s.processingComplexity}
                          </div>
                        ) : null}
                        {tags.length > 0 ? (
                          <div
                            className="text-muted-foreground mt-1.5 text-xs truncate"
                            style={{
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {tags.join(" · ")}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2.5 py-1 text-xs font-bold tracking-wide",
                            s.captionsReady
                              ? "bg-green-500/15 text-green-500"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {s.captionsReady
                            ? t.captionsReady
                            : t.captionsPending}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div
                          className="flex flex-col items-start gap-1.5"
                          style={{ width: "130px" }}
                        >
                          <select
                            className="w-full border-border bg-background text-foreground focus:ring-primary rounded-lg border px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:outline-none disabled:opacity-60 cursor-pointer"
                            value={isPublic ? "public" : "unlisted"}
                            disabled={busy}
                            aria-label={formatMessage(t.visibilityAria, {
                              name: s.name,
                            })}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v !== "public" && v !== "unlisted") return;
                              if (v === s.visibility) return;
                              void updateVisibility(s.contentId, v);
                            }}
                          >
                            <option value="public">{t.visibilityPublic}</option>
                            <option value="unlisted">
                              {t.visibilityPrivate}
                            </option>
                          </select>
                          {busy ? (
                            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                              <Loader2 className="size-3.5 animate-spin shrink-0" />
                              {t.visibilitySaving}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-2">
                          {s.contentVideoId != null ? (
                            <Link
                              to={`/content/${s.contentVideoId}`}
                              className="text-primary font-semibold text-sm hover:underline block"
                            >
                              {t.watchLesson}
                            </Link>
                          ) : null}
                          <Link
                            to={`/catalog/series/${encodeURIComponent(s.friendlyLink)}`}
                            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors hover:underline block"
                          >
                            {t.seriesPage}
                          </Link>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <button
                          onClick={() => openDeleteModal(s.contentId)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors inline-flex"
                          title={t.deleteVideoAria}
                        >
                          <Trash2 className="size-4.5" />
                        </button>
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
  );
}
