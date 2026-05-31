/**
 * Teacher profile tab: lists series this account uploaded, with links and catalog visibility.
 */
import { Fragment, useCallback, useEffect, useState } from "react";
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
};

// МАГИЯ 1: Автоматически делает скриншот первого кадра видео
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

// МАГИЯ 2: Генерирует красивую URL-ссылку для базы данных
function slugFriendly(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Date.now().toString(36);
  const slug = `${base}-${suffix}`;
  const trimmed =
    slug.length > 100 ? slug.slice(0, 100).replace(/-[^-]*$/, "") : slug;
  return trimmed?.length >= 4 ? trimmed : `video-${suffix}`;
}

export function ProfileTeacherVideos() {
  const t = useAppMessages().profileTeacherVideos;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [series, setSeries] = useState<TeacherSeriesItem[]>([]);
  const [visibilityBusyId, setVisibilityBusyId] = useState<number | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const loadSeries = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch("/contents/teacher/my-series", {
        method: "GET",
      });
      if (!res.ok) {
        setLoadError(await getResponseErrorMessage(res));
        setSeries([]);
        return;
      }
      const data: unknown = await res.json();
      if (!Array.isArray(data)) {
        setSeries([]);
        return;
      }
      setSeries(data as TeacherSeriesItem[]);
    } catch {
      setLoadError(t.loadError);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadSeries();
  }, [loadSeries]);

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

    setUploadSaving(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const fd = new FormData();

      fd.append("name", name);
      fd.append("visibility", "unlisted");
      fd.append("description", description);

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

      setUploadTitle("");
      setUploadDesc("");
      setUploadFile(null);
      await loadSeries();
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
      await loadSeries();
    } catch (e: any) {
      toast.error(e.message || t.deleteFailed);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>{t.loadingSeries}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <ProfileCard title={t.cardTitle}>
        <p className="text-destructive">{loadError}</p>
      </ProfileCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground flex-1">{t.intro}</p>
        <AdminButton
          className="gap-2 flex rounded-[15px] bg-primary px-6 py-3 text-sm font-semibold items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="h-4 w-4" />
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
            >
              {uploadSaving ? t.cancelUpload : t.cancel}
            </AdminButton>
            <AdminButton
              type="submit"
              form="upload-lesson-form"
              disabled={uploadSaving}
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
          <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
            <input
              type="file"
              accept="video/mp4,video/x-m4v,video/*"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <Upload className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">{t.browseMp4}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {uploadFile ? uploadFile.name : t.uploadHint}
            </p>
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.lessonTitleLabel}</label>
            <AdminInput
              placeholder={t.titleExample}
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.descriptionOptional}</label>
            <AdminTextarea
              placeholder={t.descriptionPlaceholder}
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              maxLength={250}
            />
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
            >
              {t.cancelUploadNo}
            </AdminButton>
            <AdminButton variant="danger" onClick={cancelUpload}>
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
            >
              {t.cancel}
            </AdminButton>
            <AdminButton
              disabled={
                isDeleting ||
                deletePhrase.trim().toLowerCase() !== t.deleteConfirmPhrase
              }
              onClick={confirmDeleteVideo}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Video className="size-12 text-muted-foreground opacity-50" />
            <p className="max-w-md text-muted-foreground">{t.emptyBody}</p>
          </div>
        </ProfileCard>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
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
                        <div className="text-foreground text-base font-bold">
                          {s.name}
                        </div>
                        {s.processingComplexity ? (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {t.processingPrefix} {s.processingComplexity}
                          </div>
                        ) : null}
                        {tags.length > 0 ? (
                          <div className="text-muted-foreground mt-1.5 max-w-md text-xs">
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
                          {s.captionsReady ? t.captionsReady : t.captionsPending}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col items-start gap-1.5">
                          <select
                            className="border-border bg-background text-foreground focus:ring-primary w-[130px] rounded-lg border px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:outline-none disabled:opacity-60 cursor-pointer"
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
                            <option value="unlisted">{t.visibilityPrivate}</option>
                          </select>
                          {busy ? (
                            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                              <Loader2 className="size-3.5 animate-spin" />
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
                              className="text-primary font-semibold text-sm hover:underline"
                            >
                              {t.watchLesson}
                            </Link>
                          ) : null}
                          <Link
                            to={`/catalog/series/${encodeURIComponent(s.friendlyLink)}`}
                            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors hover:underline"
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
