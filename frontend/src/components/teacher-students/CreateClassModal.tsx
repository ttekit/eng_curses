// src/components/teacher-students/CreateClassModal.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { apiFetch } from "../../lib/api";
import { getErrorMessage } from "../../lib/error-message";
import { AdminModal, AdminButton, AdminInput } from "../admin/adminUi";

export interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function CreateClassModal({
  open,
  onClose,
  onSuccess,
}: CreateClassModalProps) {
  const [classNameInput, setClassNameInput] = useState("");
  const [isSavingClass, setIsSavingClass] = useState(false);

  // Очищаем поле при каждом открытии
  useEffect(() => {
    if (open) {
      setClassNameInput("");
      setIsSavingClass(false);
    }
  }, [open]);

  const handleSaveClass = async () => {
    if (!classNameInput.trim()) return toast.error("Class name is required");

    setIsSavingClass(true);
    try {
      const res = await apiFetch("/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: classNameInput.trim() }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      toast.success("Class created successfully!");
      onClose();
      await onSuccess(); // Обновляем данные в таблице
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to create class"));
    } finally {
      setIsSavingClass(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={() => !isSavingClass && onClose()}
      title="Create New Class"
      footer={
        <>
          <AdminButton
            variant="outline"
            onClick={onClose}
            disabled={isSavingClass}
            className="w-full sm:w-auto"
          >
            Cancel
          </AdminButton>
          <AdminButton
            onClick={() => void handleSaveClass()}
            disabled={isSavingClass}
            className="w-full sm:w-auto"
          >
            {isSavingClass ? "Saving..." : "Create Class"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Class Name</label>
          <AdminInput
            placeholder="e.g. Group A1 - Evening"
            value={classNameInput}
            onChange={(e) => setClassNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSaveClass();
              }
            }}
            autoFocus
          />
        </div>
      </div>
    </AdminModal>
  );
}
