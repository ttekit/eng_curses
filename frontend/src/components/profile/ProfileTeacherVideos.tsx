import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Loader2,
  Video,
  Plus,
  Trash2,
  BookOpen,
  ChevronDown,
  Clock,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { cn } from "../../lib/utils";
import { ProfileCard } from "./ProfileCard";
import { useAppMessages } from "../../hooks/useAppMessages";
import {
  AdminButton,
  AdminModal,
  AdminInput,
} from "../../components/admin/adminUi";
import { getErrorMessage } from "../../lib/error-message";

import { UploadVideoModal } from "../../components/teacher-videos/UploadVideoModal";
import {
  EditDeadlineModal,
  type DeadlineData,
} from "../../components/teacher-videos/EditDeadlineModal";
import { TeacherResultsModals } from "../../components/teacher-videos/TeacherResultsModals";
import { TeacherSeriesItem } from "../types/teacher-videos";
import { CustomSelect } from "../UI/CustomSelect";

export function ProfileTeacherVideos() {
  const t = useAppMessages().profileTeacherVideos;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [activeTab, setActiveTab] = useState<"uploads" | "assigned">("uploads");
  const [series, setSeries] = useState<TeacherSeriesItem[]>([]);
  const [assignedSeries, setAssignedSeries] = useState<TeacherSeriesItem[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [filterClassId, setFilterClassId] = useState<number | "all">("all");
  const [visibilityBusyId, setVisibilityBusyId] = useState<number | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [resultsContentId, setResultsContentId] = useState<number | null>(null);
  const [editDeadlineModalOpen, setEditDeadlineModalOpen] = useState(false);
  const [editingDeadlineId, setEditingDeadlineId] = useState<number | null>(
    null,
  );
  const [deadlineInitialData, setDeadlineInitialData] =
    useState<DeadlineData | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteModalOpen && !isDeleting) setDeleteModalOpen(false);
        else if (revokeModalOpen && !isRevoking) setRevokeModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [deleteModalOpen, isDeleting, revokeModalOpen, isRevoking]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [resSeries, resClasses, resAssigned] = await Promise.all([
        apiFetch("/contents/teacher/my-series", { method: "GET" }),
        apiFetch("/teacher/classes", { method: "GET" }),
        apiFetch("/contents/teacher/assigned-homework", {
          method: "GET",
        }).catch(() => null),
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

      if (resAssigned && resAssigned.ok) {
        const assData = await resAssigned.json();
        setAssignedSeries(Array.isArray(assData) ? assData : []);
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

  const updateVisibility = useCallback(
    async (contentId: number, next: "public" | "unlisted"): Promise<void> => {
      setVisibilityBusyId(contentId);
      setVisibilityError(null);
      try {
        const res = await apiFetch(
          `/contents/teacher/${contentId}/visibility`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visibility: next }),
          },
        );
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
    },
    [t.visibilityError],
  );

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
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, t.deleteFailed));
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const confirmRevokeVideo = async () => {
    if (!revokingId) return;
    setIsRevoking(true);
    try {
      const res = await apiFetch(`/contents/teacher/assign/${revokingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success("Assignment removed successfully!");
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

  const filteredSeries = series.filter((s) => {
    if (filterClassId === "all") return true;
    return (
      s.classAccesses?.some((ca) => ca.classId === filterClassId) ||
      s.classAccesses?.length === 0
    );
  });

  const filteredAssignedSeries = assignedSeries.filter((s) => {
    if (filterClassId === "all") return true;
    return (
      s.classAccesses?.some((ca) => ca.classId === filterClassId) ||
      s.classAccesses?.length === 0
    );
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center bg-muted/50 p-1.5 rounded-xl border border-border/50 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setActiveTab("uploads")}
              className={cn(
                "flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                activeTab === "uploads"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Video className="size-4" />
              My Uploads
            </button>
            <button
              onClick={() => setActiveTab("assigned")}
              className={cn(
                "flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                activeTab === "assigned"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BookOpen className="size-4" />
              Assigned Homework
            </button>
          </div>

          <CustomSelect
            value={filterClassId === "all" ? "all" : String(filterClassId)}
            onChange={(val) =>
              setFilterClassId(val === "all" ? "all" : Number(val))
            }
            options={[
              { value: "all", label: "All Classes & Global" },
              ...classes.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
            className="w-full sm:w-56"
          />
        </div>

        <AdminButton
          className="flex rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
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

      {/* --- ИМПОРТИРОВАННЫЕ МОДАЛЬНЫЕ ОКНА --- */}
      <UploadVideoModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={loadData}
        classes={classes}
      />

      <EditDeadlineModal
        open={editDeadlineModalOpen}
        onClose={() => setEditDeadlineModalOpen(false)}
        onSuccess={loadData}
        contentId={editingDeadlineId}
        initialData={deadlineInitialData}
      />

      <TeacherResultsModals
        open={resultsModalOpen}
        onClose={() => setResultsModalOpen(false)}
        contentId={resultsContentId}
      />

      {/* ЛОКАЛЬНЫЕ МОДАЛКИ (Оставлены для удаления) */}
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
              Cancel
            </AdminButton>
            <AdminButton
              disabled={
                isDeleting ||
                deletePhrase.trim().toLowerCase() !== t.deleteConfirmPhrase
              }
              onClick={() => void confirmDeleteVideo()}
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

      <AdminModal
        open={revokeModalOpen}
        onClose={() => !isRevoking && setRevokeModalOpen(false)}
        title="Remove Homework Assignment"
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
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
            >
              {isRevoking ? "Removing..." : "Remove Assignment"}
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to remove this homework assignment? Your
          students will no longer see this video in their lessons. The video
          itself will remain in the global catalog.
        </p>
      </AdminModal>

      {/* --- ТАБЛИЦЫ --- */}
      {activeTab === "uploads" &&
        (filteredSeries.length === 0 ? (
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
                minHeight: "220px",
              }}
            >
              <table
                className="text-left text-sm table-fixed"
                style={{
                  minWidth: "1000px",
                  width: "100%",
                  whiteSpace: "nowrap",
                }}
              >
                <thead>
                  <tr className="border-border bg-muted/30 border-b text-muted-foreground">
                    <th className="p-4 font-semibold text-sm">{t.colSeries}</th>
                    <th className="p-4 font-semibold text-sm">Assignments</th>
                    <th className="p-4 font-semibold text-sm">
                      {t.colCaptions}
                    </th>
                    <th className="p-4 font-semibold text-sm">
                      {t.colCatalog}
                    </th>
                    <th className="p-4 font-semibold text-sm text-right">
                      {t.colActions}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSeries.map((s) => {
                    const busy = visibilityBusyId === s.contentId;
                    const vis = s.visibility?.trim().toLowerCase() || "public";
                    const tags = [
                      ...(s.systemTags || []),
                      ...(s.userTags || []),
                    ].filter(Boolean);
                    const now = new Date(currentTime);

                    return (
                      <tr
                        key={s.contentId}
                        className="border-border/60 hover:bg-muted/10 border-b last:border-0 transition-colors"
                      >
                        <td className="p-4 align-top">
                          <div className="text-foreground text-base font-bold truncate max-w-[200px]">
                            {s.name}
                          </div>
                          {s.processingComplexity && (
                            <div className="text-muted-foreground mt-2 text-xs truncate max-w-[200px]">
                              {t.processingPrefix} {s.processingComplexity}
                            </div>
                          )}
                          {tags.length > 0 && (
                            <div className="text-muted-foreground mt-1.5 text-xs truncate max-w-[200px]">
                              {tags.join(" · ")}
                            </div>
                          )}
                        </td>

                        <td className="p-4 align-top">
                          {s.classAccesses && s.classAccesses.length > 0 ? (
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-bold tracking-wider text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 select-none transition-colors w-fit uppercase">
                                {s.classAccesses.length === 1
                                  ? "1 CLASS ASSIGNED"
                                  : `${s.classAccesses.length} CLASSES ASSIGNED`}
                                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="mt-3 flex flex-col gap-3 pl-3 border-l-2 border-primary/30">
                                {s.classAccesses.map((ca) => (
                                  <div
                                    key={ca.classId}
                                    className="flex flex-col gap-1"
                                  >
                                    <span className="text-xs font-bold uppercase text-foreground tracking-wide">
                                      {ca.className}
                                    </span>
                                    <div className="text-sm text-muted-foreground flex flex-col gap-0.5">
                                      <span>
                                        Opens:{" "}
                                        {ca.availableFrom
                                          ? new Date(
                                              ca.availableFrom,
                                            ).toLocaleString("en-GB", {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            })
                                          : "Now"}
                                      </span>
                                      <span
                                        className={
                                          ca.deadline &&
                                          new Date(ca.deadline) < now
                                            ? "text-destructive font-medium"
                                            : "text-amber-500 font-medium"
                                        }
                                      >
                                        Closes:{" "}
                                        {ca.deadline
                                          ? new Date(
                                              ca.deadline,
                                            ).toLocaleString("en-GB", {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            })
                                          : "Never"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          ) : (
                            <div className="flex flex-col gap-1.5 text-sm font-medium text-muted-foreground">
                              <span className="inline-flex w-fit bg-accent/10 text-accent px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-xs mb-1">
                                Global Catalog
                              </span>
                              <span>
                                Opens:{" "}
                                {s.availableFrom
                                  ? new Date(s.availableFrom).toLocaleString(
                                      "en-GB",
                                      {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      },
                                    )
                                  : "Now"}
                              </span>
                              <span
                                className={
                                  s.deadline && new Date(s.deadline) < now
                                    ? "text-destructive font-medium"
                                    : "text-amber-500 font-medium"
                                }
                              >
                                Closes:{" "}
                                {s.deadline
                                  ? new Date(s.deadline).toLocaleString(
                                      "en-GB",
                                      {
                                        dateStyle: "short",
                                        timeStyle: "short",
                                      },
                                    )
                                  : "Never"}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-4 align-top">
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
                        <td className="p-4 align-top">
                          <div className="flex flex-col items-start gap-1.5 w-[130px]">
                            <CustomSelect
                              value={vis}
                              disabled={
                                busy || Boolean(s.availableFrom || s.deadline)
                              }
                              onChange={(val) => {
                                if (
                                  (val === "public" || val === "unlisted") &&
                                  val !== s.visibility
                                ) {
                                  void updateVisibility(s.contentId, val);
                                }
                              }}
                              options={[
                                { value: "public", label: t.visibilityPublic },
                                {
                                  value: "unlisted",
                                  label: t.visibilityPrivate,
                                },
                              ]}
                              className="py-1.5 font-semibold"
                            />
                            {busy && (
                              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                                <Loader2 className="size-3.5 animate-spin shrink-0" />
                                {t.visibilitySaving}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            {s.contentVideoId != null && (
                              <Link
                                to={`/content/${s.contentVideoId}`}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors inline-flex"
                                title={t.watchLesson}
                              >
                                <Video className="size-4.5" />
                              </Link>
                            )}
                            <button
                              onClick={() => openResultsModal(s.contentId)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors inline-flex"
                              title="View Tests"
                            >
                              <FileText className="size-4.5" />
                            </button>
                            <button
                              onClick={() => openEditDeadlineModal(s)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors inline-flex"
                              title="Edit Deadlines"
                            >
                              <Clock className="size-4.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingId(s.contentId);
                                setDeletePhrase("");
                                setDeleteModalOpen(true);
                              }}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors inline-flex"
                              title={t.deleteVideoAria}
                            >
                              <Trash2 className="size-4.5" />
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
        ))}

      {/* ТАБЛИЦА ASSIGNED (Практически такая же, как Uploads) */}
      {activeTab === "assigned" &&
        (filteredAssignedSeries.length === 0 ? (
          <ProfileCard title="Assigned Homework">
            <div className="flex flex-col items-center gap-3 py-8 text-center px-4">
              <BookOpen className="size-12 text-muted-foreground opacity-50" />
              <p className="max-w-md text-muted-foreground">
                You haven't assigned any lessons from the catalog yet. Go to the
                Catalog, find a video, and click "Assign Homework".
              </p>
            </div>
          </ProfileCard>
        ) : (
          <div className="w-full max-w-full overflow-auto rounded-xl border border-border/50 bg-card/50 max-h-[65vh] relative shadow-sm">
            <table className="w-full min-w-[1000px] text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 z-20 bg-card shadow-sm outline outline-1 outline-border/50">
                <tr className="text-muted-foreground">
                  <th className="p-4 font-semibold text-sm">{t.colSeries}</th>
                  <th className="p-4 font-semibold text-sm">Assignments</th>
                  <th className="p-4 font-semibold text-sm">{t.colCaptions}</th>
                  <th className="p-4 font-semibold text-sm">{t.colCatalog}</th>
                  <th className="p-4 font-semibold text-sm text-right">
                    {t.colActions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignedSeries.map((s) => {
                  const busy = visibilityBusyId === s.contentId;
                  const vis = s.visibility?.trim().toLowerCase() || "public";
                  const tags = [
                    ...(s.systemTags || []),
                    ...(s.userTags || []),
                  ].filter(Boolean);
                  const now = new Date(currentTime);

                  return (
                    <tr
                      key={s.contentId}
                      className="border-border/60 hover:bg-muted/10 border-b last:border-0 transition-colors"
                    >
                      <td className="p-4 align-top">
                        <div className="text-foreground text-base font-bold truncate max-w-[200px]">
                          {s.name}
                        </div>
                        {s.processingComplexity && (
                          <div className="text-muted-foreground mt-2 text-xs truncate max-w-[200px]">
                            {t.processingPrefix} {s.processingComplexity}
                          </div>
                        )}
                        {tags.length > 0 && (
                          <div className="text-muted-foreground mt-1.5 text-xs truncate max-w-[200px]">
                            {tags.join(" · ")}
                          </div>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        {s.classAccesses && s.classAccesses.length > 0 ? (
                          <details className="group">
                            <summary className="cursor-pointer text-xs font-bold tracking-wider text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 select-none transition-colors w-fit uppercase">
                              {s.classAccesses.length === 1
                                ? "1 CLASS ASSIGNED"
                                : `${s.classAccesses.length} CLASSES ASSIGNED`}
                              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                            </summary>
                            <div className="mt-3 flex flex-col gap-3 pl-3 border-l-2 border-primary/30">
                              {s.classAccesses.map((ca) => (
                                <div
                                  key={ca.classId}
                                  className="flex flex-col gap-1"
                                >
                                  <span className="text-xs font-bold uppercase text-foreground tracking-wide">
                                    {ca.className}
                                  </span>
                                  <div className="text-sm text-muted-foreground flex flex-col gap-0.5">
                                    <span>
                                      Opens:{" "}
                                      {ca.availableFrom
                                        ? new Date(
                                            ca.availableFrom,
                                          ).toLocaleString("en-GB", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                          })
                                        : "Now"}
                                    </span>
                                    <span
                                      className={
                                        ca.deadline &&
                                        new Date(ca.deadline) < now
                                          ? "text-destructive font-medium"
                                          : "text-amber-500 font-medium"
                                      }
                                    >
                                      Closes:{" "}
                                      {ca.deadline
                                        ? new Date(ca.deadline).toLocaleString(
                                            "en-GB",
                                            {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            },
                                          )
                                        : "Never"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <div className="flex flex-col gap-1.5 text-sm font-medium text-muted-foreground">
                            <span className="inline-flex w-fit bg-accent/10 text-accent px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-xs mb-1">
                              Global Catalog
                            </span>
                            <span>
                              Opens:{" "}
                              {s.availableFrom
                                ? new Date(s.availableFrom).toLocaleString(
                                    "en-GB",
                                    { dateStyle: "short", timeStyle: "short" },
                                  )
                                : "Now"}
                            </span>
                            <span
                              className={
                                s.deadline && new Date(s.deadline) < now
                                  ? "text-destructive font-medium"
                                  : "text-amber-500 font-medium"
                              }
                            >
                              Closes:{" "}
                              {s.deadline
                                ? new Date(s.deadline).toLocaleString("en-GB", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })
                                : "Never"}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide border",
                            s.captionsReady
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-muted/50 text-muted-foreground border-border/50",
                          )}
                        >
                          {s.captionsReady
                            ? t.captionsReady
                            : t.captionsPending}
                        </span>
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex flex-col items-start gap-1.5 w-[130px]">
                          <CustomSelect
                            value={vis}
                            disabled={
                              busy || Boolean(s.availableFrom || s.deadline)
                            }
                            onChange={(val) => {
                              if (
                                (val === "public" || val === "unlisted") &&
                                val !== s.visibility
                              ) {
                                void updateVisibility(s.contentId, val);
                              }
                            }}
                            options={[
                              { value: "public", label: t.visibilityPublic },
                              { value: "unlisted", label: t.visibilityPrivate },
                            ]}
                            className="py-1.5 font-semibold"
                          />
                          {busy && (
                            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                              <Loader2 className="size-3.5 animate-spin shrink-0" />
                              {t.visibilitySaving}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 align-top text-right">
                        <div className="inline-flex items-center justify-end gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-1">
                          {s.contentVideoId != null && (
                            <Link
                              to={`/content/${s.contentVideoId}`}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all inline-flex"
                              title={t.watchLesson}
                            >
                              <Video className="size-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => openResultsModal(s.contentId)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all inline-flex"
                            title="View Tests"
                          >
                            <FileText className="size-4" />
                          </button>
                          <button
                            onClick={() => openEditDeadlineModal(s)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm transition-all inline-flex"
                            title="Edit Deadlines"
                          >
                            <Clock className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRevokingId(s.contentId);
                              setRevokeModalOpen(true);
                            }}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:shadow-sm transition-all inline-flex"
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
        ))}
    </div>
  );
}
