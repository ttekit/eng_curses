// src/components/teacher-videos/EditDeadlineModal.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { apiFetch } from "../../lib/api";
import { getErrorMessage } from "../../lib/error-message";
import { AdminButton, AdminModal } from "../admin/adminUi";
import { ExplysDatePicker } from "../UI/ExplysDatePicker";

// Описываем структуру данных, которую модалка получает на вход
export interface DeadlineData {
  global: { availableFrom: string; deadline: string };
  classes: {
    classId: number;
    className: string;
    availableFrom: string;
    deadline: string;
  }[];
}

export interface EditDeadlineModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  contentId: number | null;
  initialData: DeadlineData | null;
}

export function EditDeadlineModal({
  open,
  onClose,
  onSuccess,
  contentId,
  initialData,
}: EditDeadlineModalProps) {
  const [editingDeadlines, setEditingDeadlines] = useState<DeadlineData | null>(
    null,
  );
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

  // Синхронизируем локальный стейт с пропсами при открытии
  useEffect(() => {
    if (open && initialData) {
      setEditingDeadlines(initialData);
      setIsSavingDeadline(false);
    }
  }, [open, initialData]);

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
    if (!contentId || !editingDeadlines) return;

    // Валидация глобальных дат
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

    // Валидация дат по классам
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
      const res = await apiFetch(`/contents/teacher/${contentId}/deadlines`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global: {
            availableFrom: editingDeadlines.global.availableFrom || null,
            deadline: editingDeadlines.global.deadline || null,
          },
          classes: editingDeadlines.classes.map((c) => ({
            classId: c.classId,
            availableFrom: c.availableFrom || null,
            deadline: c.deadline || null,
          })),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      toast.success("Deadlines updated successfully!");
      onClose();
      await onSuccess();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to update deadlines."));
    } finally {
      setIsSavingDeadline(false);
    }
  };

  if (!editingDeadlines) return null;

  return (
    <AdminModal
      open={open}
      onClose={() => !isSavingDeadline && onClose()}
      title="Edit Deadlines"
      footer={
        <>
          <AdminButton
            variant="outline"
            onClick={onClose}
            disabled={isSavingDeadline}
            className="w-full sm:w-auto"
          >
            Cancel
          </AdminButton>
          <AdminButton
            onClick={() => void handleSaveDeadline()}
            disabled={isSavingDeadline}
            className="w-full sm:w-auto"
          >
            {isSavingDeadline ? "Saving..." : "Save Deadlines"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 pb-16">
        {/* Глобальные дедлайны */}
        <div className="bg-muted/10 p-4 rounded-xl border border-border">
          <h4 className="text-sm font-bold mb-3 text-foreground">
            Global Rules (Applies to links)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Opening Date
              </label>
              <ExplysDatePicker
                id="edit-global-open-date"
                selected={
                  editingDeadlines.global.availableFrom
                    ? new Date(editingDeadlines.global.availableFrom)
                    : null
                }
                onChange={(date: Date | null) => {
                  setEditingDeadlines({
                    ...editingDeadlines,
                    global: {
                      ...editingDeadlines.global,
                      availableFrom: date ? date.toISOString() : "",
                    },
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    document.getElementById("edit-global-close-date")?.focus();
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Closing Deadline
              </label>
              <ExplysDatePicker
                id="edit-global-close-date"
                selected={
                  editingDeadlines.global.deadline
                    ? new Date(editingDeadlines.global.deadline)
                    : null
                }
                onChange={(date: Date | null) => {
                  setEditingDeadlines({
                    ...editingDeadlines,
                    global: {
                      ...editingDeadlines.global,
                      deadline: date ? date.toISOString() : "",
                    },
                  });
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

        {/* Дедлайны по классам */}
        {editingDeadlines.classes.length > 0 && (
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
                    <ExplysDatePicker
                      id={`edit-open-date-${cls.classId}`}
                      selected={
                        cls.availableFrom ? new Date(cls.availableFrom) : null
                      }
                      onChange={(date: Date | null) =>
                        handleClassDateChange(
                          idx,
                          "availableFrom",
                          date ? date.toISOString() : "",
                        )
                      }
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
                    <ExplysDatePicker
                      id={`edit-close-date-${cls.classId}`}
                      selected={cls.deadline ? new Date(cls.deadline) : null}
                      onChange={(date: Date | null) =>
                        handleClassDateChange(
                          idx,
                          "deadline",
                          date ? date.toISOString() : "",
                        )
                      }
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
  );
}
