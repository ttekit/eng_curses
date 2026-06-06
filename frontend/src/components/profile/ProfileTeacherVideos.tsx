import { useCallback, useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import {
  Loader2,
  Video,
  Plus,
  Upload,
  Trash2,
  BookOpen,
  ChevronDown,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Check,
} from "lucide-react";
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
  availableFrom?: string | null;
  deadline?: string | null;
  classesAssigned?: string;
  classIds?: number[];
  classAccesses?: {
    classId: number;
    className: string;
    availableFrom: string | null;
    deadline: string | null;
  }[];
};

function formatDateTimeLocal(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function isValidYear(dateString: string) {
  if (!dateString) return true;
  const year = dateString.split("-")[0];
  return year.length <= 4;
}

function CustomSelect({
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative w-full text-sm font-medium" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-foreground focus:outline-none transition-colors",
          isOpen
            ? "border-primary ring-1 ring-primary"
            : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={cn(
            "ml-2 size-4 shrink-0 transition-transform opacity-50",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-primary bg-background py-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                value === opt.value
                  ? "text-primary font-bold bg-primary/10"
                  : "text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const tStudents = useAppMessages().profileTeacherStudents;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState<"uploads" | "assigned">("uploads");
  const [series, setSeries] = useState<TeacherSeriesItem[]>([]);
  const [assignedSeries, setAssignedSeries] = useState<TeacherSeriesItem[]>([]);

  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [filterClassId, setFilterClassId] = useState<number | "all">("all");

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

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const [editDeadlineModalOpen, setEditDeadlineModalOpen] = useState(false);
  const [editingDeadlineId, setEditingDeadlineId] = useState<number | null>(
    null,
  );
  const [editingDeadlines, setEditingDeadlines] = useState<{
    global: { availableFrom: string; deadline: string };
    classes: {
      classId: number;
      className: string;
      availableFrom: string;
      deadline: string;
    }[];
  } | null>(null);
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

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

  // States for student tests (quiz results by video)
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [videoResults, setVideoResults] = useState<any>(null);
  const [resultsClassFilter, setResultsClassFilter] = useState<number | "all">(
    "all",
  );
  const [selectedStudentQuiz, setSelectedStudentQuiz] = useState<any>(null);

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedStudentQuiz) setSelectedStudentQuiz(null);
        else if (resultsModalOpen) setResultsModalOpen(false);
        else if (uploadOpen && !uploadSaving) setUploadOpen(false);
        else if (deleteModalOpen && !isDeleting) setDeleteModalOpen(false);
        else if (revokeModalOpen && !isRevoking) setRevokeModalOpen(false);
        else if (editDeadlineModalOpen && !isSavingDeadline)
          setEditDeadlineModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [
    selectedStudentQuiz,
    resultsModalOpen,
    uploadOpen,
    uploadSaving,
    deleteModalOpen,
    isDeleting,
    revokeModalOpen,
    isRevoking,
    editDeadlineModalOpen,
    isSavingDeadline,
  ]);

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
      } else {
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

      setUploadTitle("");
      setUploadDesc("");
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

  const openRevokeModal = (id: number) => {
    setRevokingId(id);
    setRevokeModalOpen(true);
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
    } catch (e: any) {
      toast.error(e.message || "Failed to remove assignment.");
    } finally {
      setIsRevoking(false);
      setRevokingId(null);
    }
  };

  const openEditDeadlineModal = (item: TeacherSeriesItem) => {
    setEditingDeadlineId(item.contentId);
    setEditingDeadlines({
      global: {
        availableFrom: formatDateTimeLocal(item.availableFrom),
        deadline: formatDateTimeLocal(item.deadline),
      },
      classes: item.classAccesses
        ? item.classAccesses.map((ca) => ({
            classId: ca.classId,
            className: ca.className,
            availableFrom: formatDateTimeLocal(ca.availableFrom),
            deadline: formatDateTimeLocal(ca.deadline),
          }))
        : [],
    });
    setEditDeadlineModalOpen(true);
  };

  const handleClassDateChange = (
    index: number,
    field: "availableFrom" | "deadline",
    value: string,
  ) => {
    if (!editingDeadlines) return;
    const newClasses = [...editingDeadlines.classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    setEditingDeadlines({ ...editingDeadlines, classes: newClasses });
  };

  const handleSaveDeadline = async () => {
    if (!editingDeadlineId || !editingDeadlines) return;

    if (editingDeadlines.global.deadline) {
      const cDate = new Date(editingDeadlines.global.deadline);
      if (cDate <= new Date()) {
        return toast.error("Global closing deadline cannot be in the past.");
      }
      if (
        editingDeadlines.global.availableFrom &&
        cDate <= new Date(editingDeadlines.global.availableFrom)
      ) {
        return toast.error(
          "Global closing deadline must be after opening date.",
        );
      }
    }

    for (const cls of editingDeadlines.classes) {
      if (cls.deadline) {
        const cDate = new Date(cls.deadline);
        if (cDate <= new Date()) {
          return toast.error(
            `Closing deadline for ${cls.className} cannot be in the past.`,
          );
        }
        if (cls.availableFrom && cDate <= new Date(cls.availableFrom)) {
          return toast.error(
            `Closing deadline for ${cls.className} must be after opening date.`,
          );
        }
      }
    }

    setIsSavingDeadline(true);
    try {
      const res = await apiFetch(
        `/contents/teacher/${editingDeadlineId}/deadlines`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            global: {
              availableFrom: editingDeadlines.global.availableFrom
                ? new Date(editingDeadlines.global.availableFrom).toISOString()
                : null,
              deadline: editingDeadlines.global.deadline
                ? new Date(editingDeadlines.global.deadline).toISOString()
                : null,
            },
            classes: editingDeadlines.classes.map((c) => ({
              classId: c.classId,
              availableFrom: c.availableFrom
                ? new Date(c.availableFrom).toISOString()
                : null,
              deadline: c.deadline ? new Date(c.deadline).toISOString() : null,
            })),
          }),
        },
      );
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success("Deadlines updated successfully!");
      setEditDeadlineModalOpen(false);
      await loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to update deadlines.");
    } finally {
      setIsSavingDeadline(false);
    }
  };

  const openResultsModal = async (contentId: number) => {
    setResultsLoading(true);
    setResultsModalOpen(true);
    setVideoResults(null);
    setSelectedStudentQuiz(null);
    setResultsClassFilter("all");
    try {
      const res = await apiFetch(
        `/contents/teacher/${contentId}/student-results`,
      );
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      const data = await res.json();
      setVideoResults(data);
      if (data.classes?.length === 1) {
        setResultsClassFilter(data.classes[0].id);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load results");
      setResultsModalOpen(false);
    } finally {
      setResultsLoading(false);
    }
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
          className="gap-2 flex w-full sm:w-auto rounded-[15px] bg-primary px-6 py-3 text-sm font-semibold items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] shrink-0"
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
              {uploadSaving ? t.cancelUpload : "Cancel"}
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
              <CustomSelect
                value={assignMode}
                onChange={(val) => setAssignMode(val as any)}
                options={[
                  { value: "all", label: "All my students" },
                  { value: "classes", label: "Specific classes" },
                ]}
              />
            </div>

            {assignMode === "all" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 bg-muted/20 p-4 rounded-lg border border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Global Visibility Rules
                  </label>
                  <CustomSelect
                    value={deadlineMode}
                    onChange={(val) => setDeadlineMode(val as any)}
                    options={[
                      {
                        value: "none",
                        label: "Manual start/stop (Starts Private)",
                      },
                      {
                        value: "close",
                        label: "Has closing deadline (Starts Public)",
                      },
                      {
                        value: "open_close",
                        label: "Schedule open & close dates (Starts Private)",
                      },
                    ]}
                  />
                </div>

                {deadlineMode === "open_close" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Opening Date (Becomes Public)
                    </label>
                    <AdminInput
                      type="datetime-local"
                      lang="en-GB"
                      value={openDateStr}
                      className="w-full"
                      max="9999-12-31T23:59"
                      onChange={(e) => {
                        if (isValidYear(e.target.value)) {
                          setOpenDateStr(e.target.value);
                        }
                      }}
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
                      lang="en-GB"
                      value={closeDateStr}
                      className="w-full"
                      max="9999-12-31T23:59"
                      onChange={(e) => {
                        if (isValidYear(e.target.value)) {
                          setCloseDateStr(e.target.value);
                        }
                      }}
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
                            "border border-border/70 rounded-xl p-4 space-y-4 transition-colors",
                            isSelected
                              ? "bg-primary/5 border-primary/40 shadow-sm"
                              : "bg-background hover:border-primary/30",
                          )}
                        >
                          <div
                            onClick={(e) => {
                              if (isSelected) {
                                const next = { ...selectedClasses };
                                delete next[cls.id];
                                setSelectedClasses(next);
                              } else {
                                setSelectedClasses((p) => ({
                                  ...p,
                                  [cls.id]: {
                                    availableFrom: "",
                                    deadline: "",
                                  },
                                }));
                              }
                            }}
                            className="flex items-center gap-3 font-semibold cursor-pointer text-sm select-none"
                          >
                            <div
                              className={cn(
                                "size-5 rounded flex items-center justify-center transition-colors shrink-0 border",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-background",
                              )}
                            >
                              {isSelected && (
                                <Check className="size-3.5 stroke-[3]" />
                              )}
                            </div>
                            <span className="text-foreground">{cls.name}</span>
                          </div>

                          {isSelected && (
                            <div className="flex flex-col gap-4 pl-8 pt-1">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Open Date (Optional)
                                </label>
                                <AdminInput
                                  type="datetime-local"
                                  lang="en-GB"
                                  value={data.availableFrom}
                                  className="w-full"
                                  max="9999-12-31T23:59"
                                  onChange={(e) => {
                                    if (isValidYear(e.target.value)) {
                                      setSelectedClasses((p) => ({
                                        ...p,
                                        [cls.id]: {
                                          ...p[cls.id],
                                          availableFrom: e.target.value,
                                        },
                                      }));
                                    }
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Deadline (Optional)
                                </label>
                                <AdminInput
                                  type="datetime-local"
                                  lang="en-GB"
                                  value={data.deadline}
                                  className="w-full"
                                  max="9999-12-31T23:59"
                                  onChange={(e) => {
                                    if (isValidYear(e.target.value)) {
                                      setSelectedClasses((p) => ({
                                        ...p,
                                        [cls.id]: {
                                          ...p[cls.id],
                                          deadline: e.target.value,
                                        },
                                      }));
                                    }
                                  }}
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
        open={editDeadlineModalOpen}
        onClose={() => !isSavingDeadline && setEditDeadlineModalOpen(false)}
        title="Edit Deadlines"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setEditDeadlineModalOpen(false)}
              disabled={isSavingDeadline}
              className="w-full sm:w-auto"
            >
              Cancel
            </AdminButton>
            <AdminButton
              onClick={handleSaveDeadline}
              disabled={isSavingDeadline}
              className="w-full sm:w-auto"
            >
              {isSavingDeadline ? "Saving..." : "Save Deadlines"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-muted/10 p-4 rounded-xl border border-border">
            <h4 className="text-sm font-bold mb-3 text-foreground">
              Global Rules (Applies to links)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Opening Date
                </label>
                <AdminInput
                  id="edit-global-open-date"
                  type="datetime-local"
                  lang="en-GB"
                  value={editingDeadlines?.global.availableFrom || ""}
                  className="w-full"
                  max="9999-12-31T23:59"
                  onChange={(e) => {
                    if (isValidYear(e.target.value) && editingDeadlines) {
                      setEditingDeadlines({
                        ...editingDeadlines,
                        global: {
                          ...editingDeadlines.global,
                          availableFrom: e.target.value,
                        },
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      document
                        .getElementById("edit-global-close-date")
                        ?.focus();
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Closing Deadline
                </label>
                <AdminInput
                  id="edit-global-close-date"
                  type="datetime-local"
                  lang="en-GB"
                  value={editingDeadlines?.global.deadline || ""}
                  className="w-full"
                  max="9999-12-31T23:59"
                  onChange={(e) => {
                    if (isValidYear(e.target.value) && editingDeadlines) {
                      setEditingDeadlines({
                        ...editingDeadlines,
                        global: {
                          ...editingDeadlines.global,
                          deadline: e.target.value,
                        },
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSaveDeadline();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {editingDeadlines && editingDeadlines.classes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-foreground">
                Specific Class Deadlines
              </h4>
              {editingDeadlines.classes.map((cls, idx) => (
                <div
                  key={cls.classId}
                  className="bg-primary/5 p-4 rounded-xl border border-primary/20"
                >
                  <span className="text-sm font-bold text-primary mb-3 block">
                    {cls.className}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Opening Date
                      </label>
                      <AdminInput
                        id={`edit-open-date-${cls.classId}`}
                        type="datetime-local"
                        lang="en-GB"
                        value={cls.availableFrom || ""}
                        className="w-full"
                        max="9999-12-31T23:59"
                        onChange={(e) => {
                          if (isValidYear(e.target.value)) {
                            handleClassDateChange(
                              idx,
                              "availableFrom",
                              e.target.value,
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            document
                              .getElementById(`edit-close-date-${cls.classId}`)
                              ?.focus();
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">
                        Closing Deadline
                      </label>
                      <AdminInput
                        id={`edit-close-date-${cls.classId}`}
                        type="datetime-local"
                        lang="en-GB"
                        value={cls.deadline || ""}
                        className="w-full"
                        max="9999-12-31T23:59"
                        onChange={(e) => {
                          if (isValidYear(e.target.value)) {
                            handleClassDateChange(
                              idx,
                              "deadline",
                              e.target.value,
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleSaveDeadline();
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              Cancel
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
              onClick={confirmRevokeVideo}
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

      <AdminModal
        open={resultsModalOpen && !selectedStudentQuiz}
        onClose={() => setResultsModalOpen(false)}
        title={
          videoResults ? `Tests: ${videoResults.contentName}` : "Student Tests"
        }
        footer={
          <AdminButton
            onClick={() => setResultsModalOpen(false)}
            className="w-full sm:w-auto"
          >
            Close
          </AdminButton>
        }
      >
        {resultsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : videoResults ? (
          <div className="space-y-4">
            {videoResults.classes.length > 1 && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
                  Filter by Assigned Class
                </label>
                <CustomSelect
                  value={
                    resultsClassFilter === "all"
                      ? "all"
                      : String(resultsClassFilter)
                  }
                  onChange={(val) =>
                    setResultsClassFilter(val === "all" ? "all" : Number(val))
                  }
                  options={[
                    { value: "all", label: "All Assigned Classes" },
                    ...videoResults.classes.map((c: any) => ({
                      value: String(c.id),
                      label: c.name,
                    })),
                  ]}
                />
              </div>
            )}

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {videoResults.students
                .filter(
                  (s: any) =>
                    resultsClassFilter === "all" ||
                    s.classId === resultsClassFilter,
                )
                .map((s: any) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground text-sm">
                        {s.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {s.email}
                      </span>
                      <span className="mt-1.5 inline-flex w-fit items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20">
                        {s.className || "General (No Class)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {s.attempt ? (
                        <>
                          <span
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border",
                              s.attempt.passed
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20",
                            )}
                          >
                            {s.attempt.passed ? (
                              <CheckCircle2 className="size-3.5" />
                            ) : (
                              <XCircle className="size-3.5" />
                            )}
                            {Math.round(s.attempt.scorePct)}%{" "}
                            {s.attempt.passed ? "PASS" : "FAIL"}
                          </span>
                          <button
                            onClick={() => setSelectedStudentQuiz(s)}
                            className="text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                          >
                            View Answers
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide bg-muted border border-border/50 text-muted-foreground">
                          Not started
                        </span>
                      )}
                    </div>
                  </div>
                ))}

              {videoResults.students.filter(
                (s: any) =>
                  resultsClassFilter === "all" ||
                  s.classId === resultsClassFilter,
              ).length === 0 && (
                <div className="py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
                  No students found in this category.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-destructive">
            Failed to load results.
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={!!selectedStudentQuiz}
        onClose={() => setSelectedStudentQuiz(null)}
        title={
          selectedStudentQuiz
            ? `Test Details: ${selectedStudentQuiz.name}`
            : "Quiz Details"
        }
        footer={
          <AdminButton
            className="w-full sm:w-auto"
            onClick={() => setSelectedStudentQuiz(null)}
          >
            Back
          </AdminButton>
        }
      >
        {selectedStudentQuiz && selectedStudentQuiz.attempt && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Final Score
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold",
                    selectedStudentQuiz.attempt.passed
                      ? "text-accent"
                      : "text-destructive",
                  )}
                >
                  {Math.round(selectedStudentQuiz.attempt.scorePct)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Result
                </p>
                <p className="text-xl font-bold text-foreground">
                  {selectedStudentQuiz.attempt.correct}{" "}
                  <span className="text-muted-foreground text-sm">
                    / {selectedStudentQuiz.attempt.total} correct
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Student Answers
              </h4>
              {(() => {
                let rawAnswers = selectedStudentQuiz.attempt.answers;

                if (typeof rawAnswers === "string") {
                  try {
                    rawAnswers = JSON.parse(rawAnswers);
                  } catch (e) {}
                }

                if (
                  !rawAnswers ||
                  (typeof rawAnswers !== "object" && !Array.isArray(rawAnswers))
                ) {
                  return (
                    <p className="text-sm text-muted-foreground ml-1">
                      No detailed data recorded.
                    </p>
                  );
                }

                let flatData = rawAnswers;
                if (
                  rawAnswers.answers &&
                  typeof rawAnswers.answers === "object" &&
                  !Array.isArray(rawAnswers.answers)
                ) {
                  flatData = rawAnswers.answers;
                } else if (
                  rawAnswers.questions &&
                  typeof rawAnswers.questions === "object" &&
                  !Array.isArray(rawAnswers.questions)
                ) {
                  flatData = rawAnswers.questions;
                }

                if (Array.isArray(flatData)) {
                  return (
                    <div className="flex flex-col gap-4">
                      {flatData.map((q: any, idx: number) => {
                        const qText =
                          q.question || q.prompt || `Question ${idx + 1}`;
                        const opts = q.options || q.choices || [];
                        const studentChoice =
                          q.studentIndex ??
                          q.studentChoice ??
                          q.userAnswer ??
                          q.answer ??
                          -1;
                        const correctChoice =
                          q.correctIndex ??
                          q.correctChoice ??
                          q.correctAnswer ??
                          q.correct ??
                          -1;

                        if (!opts || opts.length === 0) {
                          const writtenAns =
                            q.userAnswer || q.answer || q.text || String(q);
                          return (
                            <div
                              key={idx}
                              className="bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm"
                            >
                              <p className="font-semibold text-foreground mb-3 text-[15px]">
                                {qText}
                              </p>
                              <div className="bg-background/60 border border-border/50 p-4 rounded-lg">
                                <p className="text-[10px] font-bold text-primary tracking-wider mb-2 uppercase">
                                  WRITTEN ANSWER
                                </p>
                                <p className="text-sm italic text-foreground break-words leading-relaxed">
                                  "{writtenAns}"
                                </p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={idx}
                            className="bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm"
                          >
                            <span className="text-[15px] text-foreground font-semibold break-words leading-snug">
                              {qText}
                            </span>
                            <div className="flex flex-col gap-2.5 mt-3">
                              {opts.map((opt: string, optIdx: number) => {
                                const isStudentChoice =
                                  studentChoice === optIdx;
                                const isCorrectChoice =
                                  correctChoice === optIdx;

                                let variantClass =
                                  "border-border/40 bg-background/40 text-muted-foreground";
                                let badgeClass =
                                  "bg-background border border-border/50 text-muted-foreground";

                                if (isCorrectChoice && isStudentChoice) {
                                  variantClass =
                                    "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 font-medium shadow-sm";
                                  badgeClass =
                                    "bg-green-500 text-white border-green-500";
                                } else if (isStudentChoice) {
                                  variantClass =
                                    "border-destructive/40 bg-destructive/10 text-destructive font-medium shadow-sm";
                                  badgeClass =
                                    "bg-destructive text-white border-destructive";
                                } else if (isCorrectChoice) {
                                  variantClass =
                                    "border-green-500/30 bg-background text-green-600 dark:text-green-400";
                                  badgeClass =
                                    "bg-green-500/20 text-green-600 border-green-500/30";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                                      variantClass,
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "flex items-center justify-center shrink-0 rounded-md size-6 text-[11px] font-bold",
                                        badgeClass,
                                      )}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="break-words leading-tight flex-1">
                                      {opt}
                                    </span>
                                    {isCorrectChoice && isStudentChoice && (
                                      <CheckCircle2 className="size-4 shrink-0" />
                                    )}
                                    {isStudentChoice && !isCorrectChoice && (
                                      <XCircle className="size-4 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // Flat object parser (for format like { c1: 2, c1_options: "[...]" })
                const baseKeys = Object.keys(rawAnswers).filter(
                  (k) =>
                    !k.endsWith("_text") &&
                    !k.endsWith("_options") &&
                    !k.endsWith("_correct") &&
                    !k.endsWith("_question") &&
                    k !== "summaryText" &&
                    k !== "summary" &&
                    k !== "open",
                );

                return (
                  <div className="flex flex-col gap-4">
                    {baseKeys.map((key) => {
                      const val = rawAnswers[key];
                      const qText =
                        rawAnswers[`${key}_question`] ||
                        `Question ${key.toUpperCase()}`;
                      let opts = rawAnswers[`${key}_options`];
                      const corr = rawAnswers[`${key}_correct`];

                      if (typeof opts === "string") {
                        try {
                          opts = JSON.parse(opts);
                        } catch (e) {}
                      }

                      if (Array.isArray(opts)) {
                        const studentIdx = Number(val);
                        const correctIdx = Number(corr);
                        return (
                          <div
                            key={key}
                            className="bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm"
                          >
                            <p className="font-semibold text-foreground mb-4 text-[15px]">
                              {qText}
                            </p>
                            <div className="flex flex-col gap-2.5">
                              {opts.map((opt: string, idx: number) => {
                                const isStudent = studentIdx === idx;
                                const isCorrect = correctIdx === idx;

                                let variantClass =
                                  "border-border/40 bg-background/40 text-muted-foreground";
                                let badgeClass =
                                  "bg-background border border-border/50 text-muted-foreground";

                                if (isCorrect && isStudent) {
                                  variantClass =
                                    "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 font-medium shadow-sm";
                                  badgeClass =
                                    "bg-green-500 text-white border-green-500";
                                } else if (isStudent) {
                                  variantClass =
                                    "border-destructive/40 bg-destructive/10 text-destructive font-medium shadow-sm";
                                  badgeClass =
                                    "bg-destructive text-white border-destructive";
                                } else if (isCorrect) {
                                  variantClass =
                                    "border-green-500/30 bg-background text-green-600 dark:text-green-400";
                                  badgeClass =
                                    "bg-green-500/20 text-green-600 border-green-500/30";
                                }

                                return (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                                      variantClass,
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "flex items-center justify-center shrink-0 rounded-md size-6 text-[11px] font-bold",
                                        badgeClass,
                                      )}
                                    >
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="break-words leading-tight flex-1">
                                      {opt}
                                    </span>
                                    {isCorrect && isStudent && (
                                      <CheckCircle2 className="size-4 shrink-0" />
                                    )}
                                    {isStudent && !isCorrect && (
                                      <XCircle className="size-4 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      if (typeof val === "object" && val !== null) return null;

                      return (
                        <div
                          key={key}
                          className="bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm"
                        >
                          <p className="font-semibold text-foreground mb-3 text-[15px]">
                            {qText}
                          </p>
                          <div className="bg-background/60 border border-border/50 p-4 rounded-lg">
                            <p className="text-[10px] font-bold text-primary tracking-wider mb-2 uppercase">
                              WRITTEN ANSWER
                            </p>
                            <p className="text-sm italic text-foreground break-words leading-relaxed">
                              "{val}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </AdminModal>

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
              }}
            >
              <table
                className="text-left text-sm"
                style={{
                  minWidth: "900px",
                  width: "100%",
                  whiteSpace: "nowrap",
                }}
              >
                <thead>
                  <tr className="border-border bg-muted/30 border-b text-muted-foreground">
                    <th className="p-4 font-semibold text-sm">{t.colSeries}</th>
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
                    const vis = s.visibility.trim().toLowerCase();
                    const tags = [...s.systemTags, ...s.userTags].filter(
                      Boolean,
                    );
                    const now = new Date(currentTime);

                    let computedVis = vis;

                    return (
                      <tr
                        key={s.contentId}
                        className="border-border/60 hover:bg-muted/10 border-b last:border-0 transition-colors"
                      >
                        <td className="p-4 align-top">
                          <div className="text-foreground text-base font-bold truncate max-w-[200px]">
                            {s.name}
                          </div>

                          {s.classAccesses && s.classAccesses.length > 0 ? (
                            <details className="mt-1.5 group">
                              <summary className="cursor-pointer text-[10px] font-bold tracking-wider text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-md inline-flex items-center gap-1 select-none transition-colors w-fit">
                                {s.classAccesses.length === 1
                                  ? "1 CLASS ASSIGNED"
                                  : `${s.classAccesses.length} CLASSES ASSIGNED`}
                                <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="mt-2 flex flex-col gap-2 pl-2 border-l-2 border-primary/20">
                                {s.classAccesses.map((ca) => (
                                  <div
                                    key={ca.classId}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="text-[10px] font-bold uppercase text-foreground">
                                      {ca.className}
                                    </span>
                                    <div className="text-[10px] text-muted-foreground flex flex-col">
                                      {ca.availableFrom ? (
                                        <span>
                                          Opens:{" "}
                                          {new Date(
                                            ca.availableFrom,
                                          ).toLocaleString("en-GB", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                          })}
                                        </span>
                                      ) : (
                                        <span>Opens: Now</span>
                                      )}
                                      {ca.deadline ? (
                                        <span
                                          className={
                                            new Date(ca.deadline) < now
                                              ? "text-destructive"
                                              : "text-amber-500"
                                          }
                                        >
                                          Closes:{" "}
                                          {new Date(ca.deadline).toLocaleString(
                                            "en-GB",
                                            {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            },
                                          )}
                                        </span>
                                      ) : (
                                        <span>Closes: Never</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          ) : (
                            <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] font-medium text-muted-foreground">
                              <span className="inline-flex w-fit bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1">
                                Global Catalog
                              </span>
                              {s.availableFrom ? (
                                <span>
                                  Opens:{" "}
                                  {new Date(s.availableFrom).toLocaleString(
                                    "en-GB",
                                    { dateStyle: "short", timeStyle: "short" },
                                  )}
                                </span>
                              ) : (
                                <span>Opens: Now</span>
                              )}
                              {s.deadline ? (
                                <span
                                  className={
                                    new Date(s.deadline) < now
                                      ? "text-destructive"
                                      : "text-amber-500"
                                  }
                                >
                                  Closes:{" "}
                                  {new Date(s.deadline).toLocaleString(
                                    "en-GB",
                                    { dateStyle: "short", timeStyle: "short" },
                                  )}
                                </span>
                              ) : (
                                <span>Closes: Never</span>
                              )}
                            </div>
                          )}

                          {s.processingComplexity ? (
                            <div
                              className="text-muted-foreground mt-2 text-xs truncate"
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
                          <div
                            className="flex flex-col items-start gap-1.5"
                            style={{ width: "130px" }}
                          >
                            <CustomSelect
                              value={computedVis}
                              disabled={
                                busy || Boolean(s.availableFrom || s.deadline)
                              }
                              onChange={(val) => {
                                if (val !== "public" && val !== "unlisted")
                                  return;
                                if (val === s.visibility) return;
                                void updateVisibility(
                                  s.contentId,
                                  val as "public" | "unlisted",
                                );
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
                            {busy ? (
                              <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                                <Loader2 className="size-3.5 animate-spin shrink-0" />
                                {t.visibilitySaving}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            {s.contentVideoId != null ? (
                              <Link
                                to={`/content/${s.contentVideoId}`}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors inline-flex"
                                title={t.watchLesson}
                              >
                                <Video className="size-4.5" />
                              </Link>
                            ) : null}
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
                              onClick={() => openDeleteModal(s.contentId)}
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
          <div className="w-full rounded-xl border border-border/50 bg-card/50 shadow-sm overflow-hidden">
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table className="text-left text-sm w-full whitespace-nowrap min-w-[700px]">
                <thead>
                  <tr className="border-border bg-muted/30 border-b text-muted-foreground">
                    <th className="p-4 font-semibold text-sm">Lesson Name</th>
                    <th className="p-4 font-semibold text-sm text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignedSeries.map((s) => {
                    const now = new Date(currentTime);
                    return (
                      <tr
                        key={s.contentId}
                        className="border-border/60 hover:bg-muted/10 border-b last:border-0 transition-colors"
                      >
                        <td className="p-4 align-top">
                          <div className="text-foreground text-base font-bold truncate max-w-[250px]">
                            {s.name}
                          </div>

                          {s.classAccesses && s.classAccesses.length > 0 ? (
                            <details className="mt-1.5 group">
                              <summary className="cursor-pointer text-[10px] font-bold tracking-wider text-accent bg-accent/10 hover:bg-accent/20 px-2 py-1 rounded-md inline-flex items-center gap-1 select-none transition-colors w-fit uppercase">
                                {s.classAccesses.length === 1
                                  ? "1 CLASS ASSIGNED"
                                  : `${s.classAccesses.length} CLASSES ASSIGNED`}
                                <ChevronDown className="size-3 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="mt-2 flex flex-col gap-2 pl-2 border-l-2 border-accent/20">
                                {s.classAccesses.map((ca) => (
                                  <div
                                    key={ca.classId}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="text-[10px] font-bold uppercase text-foreground">
                                      {ca.className}
                                    </span>
                                    <div className="text-[10px] text-muted-foreground flex flex-col">
                                      {ca.availableFrom ? (
                                        <span>
                                          Opens:{" "}
                                          {new Date(
                                            ca.availableFrom,
                                          ).toLocaleString("en-GB", {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                          })}
                                        </span>
                                      ) : (
                                        <span>Opens: Now</span>
                                      )}
                                      {ca.deadline ? (
                                        <span
                                          className={
                                            new Date(ca.deadline) < now
                                              ? "text-destructive"
                                              : "text-amber-500"
                                          }
                                        >
                                          Closes:{" "}
                                          {new Date(ca.deadline).toLocaleString(
                                            "en-GB",
                                            {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            },
                                          )}
                                        </span>
                                      ) : (
                                        <span>Closes: Never</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          ) : (
                            <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] font-medium text-muted-foreground">
                              <span className="inline-flex w-fit bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1">
                                Global Catalog
                              </span>
                              {s.availableFrom ? (
                                <span>
                                  Opens:{" "}
                                  {new Date(s.availableFrom).toLocaleString(
                                    "en-GB",
                                    { dateStyle: "short", timeStyle: "short" },
                                  )}
                                </span>
                              ) : (
                                <span>Opens: Now</span>
                              )}
                              {s.deadline ? (
                                <span
                                  className={
                                    new Date(s.deadline) < now
                                      ? "text-destructive"
                                      : "text-amber-500"
                                  }
                                >
                                  Closes:{" "}
                                  {new Date(s.deadline).toLocaleString(
                                    "en-GB",
                                    { dateStyle: "short", timeStyle: "short" },
                                  )}
                                </span>
                              ) : (
                                <span>Closes: Never</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            {s.contentVideoId != null && (
                              <Link
                                to={`/content/${s.contentVideoId}`}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors inline-flex"
                                title="Open Lesson"
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
                              onClick={() => openRevokeModal(s.contentId)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
                              title="Remove Assignment"
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
    </div>
  );
}
