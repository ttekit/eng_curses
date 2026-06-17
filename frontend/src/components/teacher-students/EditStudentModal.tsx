// src/components/teacher-students/EditStudentModal.tsx
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { apiFetch } from "../../lib/api";
import { getErrorMessage } from "../../lib/error-message";
import { AdminModal, AdminButton, AdminInput } from "../admin/adminUi";

import { useAppMessages } from "../../hooks/useAppMessages";
import { TeacherClass, TeacherStudentResult } from "../types/teacher-students";
import { SearchableSelect } from "../UI/SearchableSelect";

export interface NewStudentCredentials {
  email: string;
  password: string;
  isReset?: boolean;
}

export interface EditStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newCreds?: NewStudentCredentials) => Promise<void>;
  classes: TeacherClass[];
  studentToEdit: TeacherStudentResult | null;
}

export function EditStudentModal({
  open,
  onClose,
  onSuccess,
  classes,
  studentToEdit,
}: EditStudentModalProps) {
  const t = useAppMessages().profileTeacherStudents;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classId: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [randomId, setRandomId] = useState<number>(0);

  // Инициализация формы при открытии
  useEffect(() => {
    if (open) {
      if (studentToEdit) {
        // Режим редактирования
        const parts = studentToEdit.name.split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        const match = studentToEdit.email.match(/\.(\d+)@/);
        const existingRandomId = match
          ? parseInt(match[1])
          : Math.floor(1000 + Math.random() * 9000);

        setRandomId(existingRandomId);
        setFormData({
          firstName,
          lastName,
          email: studentToEdit.email,
          classId: studentToEdit.classId ? String(studentToEdit.classId) : "",
        });
      } else {
        // Режим добавления нового
        setRandomId(Math.floor(1000 + Math.random() * 9000));
        setFormData({ firstName: "", lastName: "", email: "", classId: "" });
      }
      setIsSaving(false);
    }
  }, [open, studentToEdit]);

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    const sanitized = value.replace(/[^A-Za-z-]/g, "");
    if (sanitized !== value) {
      toast.error(t.englishLettersOnly, { id: "lang-error" });
    }

    setFormData((prev) => {
      const next = { ...prev, [field]: sanitized };
      const first = next.firstName.toLowerCase().replace(/[^a-z]/g, "");
      const last = next.lastName.toLowerCase().replace(/[^a-z]/g, "");
      next.email =
        first || last ? `${first}.${last}.${randomId}@explys.com` : "";
      return next;
    });
  };

  const handleSaveStudent = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error(t.namesRequired);
      return;
    }

    setIsSaving(true);
    try {
      const isEditing = !!studentToEdit;
      const url = isEditing
        ? `/teacher/my-students/${studentToEdit.id}`
        : "/teacher/my-students";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email,
        classId: formData.classId ? parseInt(formData.classId) : null,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const responseData = await res.json();
      onClose();

      // Если это новый студент и бэкенд вернул временный пароль
      if (!isEditing && responseData.tempPassword) {
        await onSuccess({
          email: formData.email,
          password: responseData.tempPassword,
        });
      } else {
        toast.success(t.studentUpdated);
        await onSuccess();
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, t.operationFailed));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={() => !isSaving && onClose()}
      title={studentToEdit ? t.editStudent : t.registerStudent}
      footer={
        <>
          <AdminButton
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {t.cancel}
          </AdminButton>
          <AdminButton
            type="submit"
            form="add-student-form"
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? t.saving : t.saveStudent}
          </AdminButton>
        </>
      }
    >
      <form
        id="add-student-form"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (isSaving) return;
          void handleSaveStudent();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.firstNameLabel}</label>
            <AdminInput
              placeholder={t.firstNamePlaceholder}
              value={formData.firstName}
              className="w-full"
              onChange={(e) => handleNameChange("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.lastNameLabel}</label>
            <AdminInput
              placeholder={t.lastNamePlaceholder}
              value={formData.lastName}
              className="w-full"
              onChange={(e) => handleNameChange("lastName", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assign to Class</label>
          <SearchableSelect
            value={formData.classId}
            onChange={(val) =>
              setFormData((p) => ({ ...p, classId: String(val) }))
            }
            showSearch={true}
            searchPlaceholder="Searching for a class..."
            options={[
              { value: "", label: "No Class (General)" },
              ...classes.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t.generatedEmailLabel}</label>
          <AdminInput
            type="email"
            placeholder={t.generatedEmailPlaceholder}
            value={formData.email}
            readOnly
            className="bg-muted w-full text-muted-foreground cursor-not-allowed"
          />
          {!studentToEdit && (
            <p className="text-xs text-muted-foreground mt-1">
              {t.passwordHint}
            </p>
          )}
        </div>
      </form>
    </AdminModal>
  );
}
