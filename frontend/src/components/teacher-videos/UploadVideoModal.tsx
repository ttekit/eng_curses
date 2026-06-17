// src/components/teacher-videos/UploadVideoModal.tsx
import { useState, useEffect } from "react";
import { Upload, Check } from "lucide-react";
import toast from "react-hot-toast";

// Проверьте правильность путей (зависит от того, где лежат ваши папки)
import { apiFetch } from "../../lib/api";
import { getErrorMessage } from "../../lib/error-message";
import { cn } from "../../lib/utils";
import { generateVideoThumbnailBlob } from "../../lib/video-utils";

import {
  AdminButton,
  AdminModal,
  AdminInput,
  AdminTextarea,
} from "../admin/adminUi";
import { useAppMessages } from "../../hooks/useAppMessages";
import { CustomSelect } from "../UI/CustomSelect";
import { ExplysDatePicker } from "../UI/ExplysDatePicker";

export interface UploadVideoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  classes: { id: number; name: string }[];
}

export function UploadVideoModal({
  open,
  onClose,
  onSuccess,
  classes,
}: UploadVideoModalProps) {
  const t = useAppMessages().profileTeacherVideos;

  // Все локальные стейты, которые раньше засоряли главный файл
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSaving, setUploadSaving] = useState(false);

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

  // Очищаем форму при каждом открытии модалки
  useEffect(() => {
    if (open) {
      setUploadTitle("");
      setUploadDesc("");
      setUploadFile(null);
      setUploadSaving(false);
      setAssignMode("all");
      setDeadlineMode("none");
      setOpenDateStr("");
      setCloseDateStr("");
      setSelectedClasses({});
      setCancelConfirmOpen(false);
    }
  }, [open]);

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
      onClose(); // Закрываем модалку
      await onSuccess(); // Обновляем данные в таблице
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        toast.error(t.uploadCancelledToast);
      } else {
        toast.error(getErrorMessage(e, t.uploadFailed));
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
      onClose();
      setUploadSaving(false);
    }
  };

  return (
    <>
      <AdminModal
        open={open}
        onClose={() => !uploadSaving && onClose()}
        title={t.uploadModalTitle}
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() =>
                uploadSaving ? setCancelConfirmOpen(true) : onClose()
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
                onChange={(val) => setAssignMode(val as "all" | "classes")}
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
                    onChange={(val) =>
                      setDeadlineMode(val as "none" | "close" | "open_close")
                    }
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
                    <ExplysDatePicker
                      id="upload-global-open"
                      selected={openDateStr ? new Date(openDateStr) : null}
                      onChange={(date: Date | null) =>
                        setOpenDateStr(date ? date.toISOString() : "")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          document
                            .getElementById("upload-global-close")
                            ?.focus();
                        }
                      }}
                    />
                  </div>
                )}

                {(deadlineMode === "close" ||
                  deadlineMode === "open_close") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Closing Deadline (Becomes Private)
                    </label>
                    <ExplysDatePicker
                      id="upload-global-close"
                      selected={closeDateStr ? new Date(closeDateStr) : null}
                      onChange={(date: Date | null) =>
                        setCloseDateStr(date ? date.toISOString() : "")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleUpload();
                        }
                      }}
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
                            onClick={() => {
                              if (isSelected) {
                                const next = { ...selectedClasses };
                                delete next[cls.id];
                                setSelectedClasses(next);
                              } else {
                                setSelectedClasses((p) => ({
                                  ...p,
                                  [cls.id]: { availableFrom: "", deadline: "" },
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
                                <ExplysDatePicker
                                  id={`upload-open-${cls.id}`}
                                  selected={
                                    data.availableFrom
                                      ? new Date(data.availableFrom)
                                      : null
                                  }
                                  onChange={(date: Date | null) => {
                                    setSelectedClasses((p) => ({
                                      ...p,
                                      [cls.id]: {
                                        ...p[cls.id],
                                        availableFrom: date
                                          ? date.toISOString()
                                          : "",
                                      },
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      document
                                        .getElementById(
                                          `upload-close-${cls.id}`,
                                        )
                                        ?.focus();
                                    }
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Deadline (Optional)
                                </label>
                                <ExplysDatePicker
                                  id={`upload-close-${cls.id}`}
                                  selected={
                                    data.deadline
                                      ? new Date(data.deadline)
                                      : null
                                  }
                                  onChange={(date: Date | null) => {
                                    setSelectedClasses((p) => ({
                                      ...p,
                                      [cls.id]: {
                                        ...p[cls.id],
                                        deadline: date
                                          ? date.toISOString()
                                          : "",
                                      },
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      void handleUpload();
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

      {/* Модалка подтверждения отмены загрузки */}
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
    </>
  );
}
