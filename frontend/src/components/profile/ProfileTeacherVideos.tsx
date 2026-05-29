/**
 * Teacher profile tab: lists series this account uploaded, with links and catalog visibility.
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2, Video, Plus, Upload, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ProfileCard } from "./ProfileCard";
import {
  AdminButton,
  AdminModal,
  AdminInput,
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

export function ProfileTeacherVideos() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [series, setSeries] = useState<TeacherSeriesItem[]>([]);
  const [visibilityBusyId, setVisibilityBusyId] = useState<number | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
      setLoadError("Could not load your uploaded series.");
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      setVisibilityError("Could not update catalog visibility.");
    } finally {
      setVisibilityBusyId(null);
    }
  }

  const handleUpload = async () => {
    const name = uploadTitle.trim();
    if (name.length < 2) {
      toast.error("Title must be at least 2 characters");
      return;
    }
    if (!uploadFile) {
      toast.error("Choose an MP4 file.");
      return;
    }

    setUploadSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("name", name);
      fd.append("visibility", "unlisted");

      const res = await apiFetch("/contents/teacher/upload", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(await getResponseErrorMessage(res));

      toast.success("Lesson uploaded successfully!");
      setUploadOpen(false);
      setUploadTitle("");
      setUploadFile(null);
      await loadSeries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadSaving(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setDeletePhrase("");
    setDeleteModalOpen(true);
  };

  const confirmDeleteVideo = async () => {
    if (deletePhrase.trim().toLowerCase() !== "delete video") {
      toast.error("Incorrect phrase. Please type 'delete video'.");
      return;
    }
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const res = await apiFetch(`/contents/teacher/my-series/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success("Video deleted successfully");
      setDeleteModalOpen(false);
      await loadSeries();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>Loading your series…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <ProfileCard title="Your videos">
        <p className="text-destructive">{loadError}</p>
      </ProfileCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground flex-1">
          Series you uploaded: open a lesson, jump to the series page, or change
          whether it appears in the public catalog.
        </p>
        <AdminButton
          className="gap-2 flex rounded-[15px] bg-primary px-6 py-3 text-sm font-semibold items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Upload lesson
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
        title="Upload new lesson"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setUploadOpen(false)}
              disabled={uploadSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton
              disabled={uploadSaving}
              onClick={() => void handleUpload()}
            >
              {uploadSaving ? "Publishing…" : "Publish"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50">
            <input
              type="file"
              accept="video/mp4,video/x-m4v,video/*"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            <Upload className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Browse for MP4</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {uploadFile
                ? uploadFile.name
                : "This video will be available to your students"}
            </p>
          </label>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lesson Title</label>
            <AdminInput
              placeholder="e.g., Present Simple Explained"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Video"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </AdminButton>
            <AdminButton
              disabled={
                isDeleting ||
                deletePhrase.trim().toLowerCase() !== "delete video"
              }
              onClick={confirmDeleteVideo}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? "Deleting…" : "Delete Video"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this video? This action cannot be
            undone.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              To confirm, type{" "}
              <span className="font-black text-destructive text-base">
                delete video
              </span>{" "}
              below:
            </label>
            <AdminInput
              type="text"
              placeholder="delete video"
              value={deletePhrase}
              onChange={(e) => setDeletePhrase(e.target.value)}
              autoComplete="off"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  deletePhrase.trim().toLowerCase() === "delete video" &&
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
        <ProfileCard title="Your videos">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Video className="size-12 text-muted-foreground opacity-50" />
            <p className="max-w-md text-muted-foreground">
              You have not uploaded any lessons yet. Click "Upload lesson" above
              to publish your first video.
            </p>
          </div>
        </ProfileCard>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-border bg-muted/30 border-b text-muted-foreground">
                  <th className="p-3 font-medium">Series</th>
                  <th className="p-3 font-medium">Captions</th>
                  <th className="p-3 font-medium">Catalog</th>
                  <th className="p-3 font-medium">Open</th>
                  <th className="p-3 font-medium text-right">Actions</th>
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
                      className="border-border/60 hover:bg-muted/20 border-b transition-colors"
                    >
                      <td className="p-3 align-top">
                        <div className="text-foreground font-medium">
                          {s.name}
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          /{s.friendlyLink}
                        </div>
                        {s.processingComplexity ? (
                          <div className="text-muted-foreground mt-1 text-xs">
                            Processing: {s.processingComplexity}
                          </div>
                        ) : null}
                        {tags.length > 0 ? (
                          <div className="text-muted-foreground mt-2 max-w-md text-xs">
                            {tags.join(" · ")}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3 align-top">
                        <span
                          className={cn(
                            "inline-flex rounded px-2 py-0.5 text-xs font-medium",
                            s.captionsReady
                              ? "bg-accent/15 text-accent"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {s.captionsReady ? "Ready" : "Pending"}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <select
                          className="border-border bg-background text-foreground focus:ring-primary max-w-[180px] rounded-lg border px-2 py-1.5 text-sm focus:ring-2 focus:outline-none disabled:opacity-60"
                          value={isPublic ? "public" : "unlisted"}
                          disabled={busy}
                          aria-label={`Catalog visibility for ${s.name}`}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v !== "public" && v !== "unlisted") return;
                            if (v === s.visibility) return;
                            void updateVisibility(s.contentId, v);
                          }}
                        >
                          <option value="public">Public</option>
                          <option value="unlisted">Private</option>
                        </select>
                        {busy ? (
                          <span className="text-muted-foreground ml-2 inline-flex items-center gap-1 text-xs">
                            <Loader2 className="size-3.5 animate-spin" />
                            Saving
                          </span>
                        ) : null}
                      </td>
                      <td className="text-primary p-3 align-top text-sm">
                        <div className="flex flex-col gap-1.5">
                          {s.contentVideoId != null ? (
                            <Link
                              to={`/content/${s.contentVideoId}`}
                              className="hover:underline"
                            >
                              Watch lesson
                            </Link>
                          ) : null}
                          <Link
                            to={`/catalog/series/${encodeURIComponent(s.friendlyLink)}`}
                            className="hover:underline"
                          >
                            Series page
                          </Link>
                        </div>
                      </td>
                      <td className="p-3 align-top text-right">
                        <button
                          onClick={() => openDeleteModal(s.contentId)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors inline-flex"
                          title="Delete video"
                        >
                          <Trash2 className="size-4" />
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
