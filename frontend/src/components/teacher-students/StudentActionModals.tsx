// src/components/teacher-students/StudentActionModals.tsx
import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

import { apiFetch, getResponseErrorMessage } from "../../lib/api";
import { getErrorMessage } from "../../lib/error-message";
import { AdminModal, AdminButton, AdminInput } from "../admin/adminUi";
import { useAppMessages } from "../../hooks/useAppMessages";

import type { NewStudentCredentials } from "./EditStudentModal";
import { TeacherStudentResult } from "../types/teacher-students";

//Модалка сброса пароля
export function ResetPasswordModal({
  open,
  student,
  onClose,
  onSuccess,
}: {
  open: boolean;
  student: TeacherStudentResult | null;
  onClose: () => void;
  onSuccess: (creds: NewStudentCredentials) => void;
}) {
  const t = useAppMessages().profileTeacherStudents;
  const [isResetting, setIsResetting] = useState(false);

  const confirmResetPassword = async () => {
    if (!student) return;
    setIsResetting(true);
    try {
      const res = await apiFetch(
        `/teacher/my-students/${student.id}/reset-password`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      const data = await res.json();

      toast.success("New password generated successfully!");
      onSuccess({
        email: student.email,
        password: data.tempPassword,
        isReset: true,
      });
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to reset password"));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={() => !isResetting && onClose()}
      title="Generate New Password"
      footer={
        <>
          <AdminButton
            variant="outline"
            onClick={onClose}
            disabled={isResetting}
            className="w-full sm:w-auto"
          >
            {t.cancel}
          </AdminButton>
          <AdminButton
            onClick={() => void confirmResetPassword()}
            disabled={isResetting}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            {isResetting ? "Generating..." : "Generate Password"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          Are you sure you want to generate a new password for{" "}
          <strong className="font-bold">{student?.name}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          The old password will stop working immediately. You will be shown the
          new password on the next screen.
        </p>
      </div>
    </AdminModal>
  );
}

//Модалка показа новых доступов (Email/Пароль)
export function NewCredentialsModal({
  creds,
  onClose,
}: {
  creds: NewStudentCredentials | null;
  onClose: () => void;
}) {
  const t = useAppMessages().profileTeacherStudents;

  return (
    <AdminModal
      open={!!creds}
      onClose={onClose}
      title={
        creds?.isReset ? "🔑 New Password Generated" : `🎉 ${t.registeredTitle}`
      }
      footer={
        <AdminButton className="w-full sm:w-auto" onClick={onClose}>
          {t.credentialsSaved}
        </AdminButton>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          {t.credentialsLead}{" "}
          <strong className="text-foreground">
            {t.credentialsPasswordNote}
          </strong>
        </p>

        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.emailAddressLabel}
            </label>
            <div className="flex gap-2">
              <AdminInput
                value={creds?.email || ""}
                readOnly
                className="bg-background text-foreground flex-1"
              />
              <AdminButton
                variant="outline"
                className="px-3 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(creds?.email || "");
                  toast.success(t.emailCopied);
                }}
                title={t.copyEmail}
              >
                <Copy className="size-4" />
              </AdminButton>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.tempPasswordLabel}
            </label>
            <div className="flex gap-2">
              <AdminInput
                value={creds?.password || ""}
                readOnly
                className="bg-background font-mono text-foreground font-bold flex-1"
              />
              <AdminButton
                variant="outline"
                className="px-3 shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(creds?.password || "");
                  toast.success(t.passwordCopied);
                }}
                title={t.copyPassword}
              >
                <Copy className="size-4" />
              </AdminButton>
            </div>
          </div>
        </div>

        <AdminButton
          variant="outline"
          className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10 justify-center"
          onClick={() => {
            if (creds) {
              navigator.clipboard.writeText(
                `Email: ${creds.email}\nPassword: ${creds.password}`,
              );
              toast.success(t.bothCopied);
            }
          }}
        >
          <Copy className="size-4 shrink-0" />
          {t.copyBoth}
        </AdminButton>
      </div>
    </AdminModal>
  );
}

//Модалка удаления ученика
export function DeleteStudentModal({
  open,
  studentId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  studentId: number | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const t = useAppMessages().profileTeacherStudents;
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open) setDeletePhrase("");
  }, [open]);

  const confirmDelete = async () => {
    if (deletePhrase.trim().toLowerCase() !== t.deleteConfirmPhrase) {
      return toast.error(t.deleteWrongPhrase);
    }
    if (!studentId) return;

    setIsDeleting(true);
    try {
      const res = await apiFetch(`/teacher/my-students/${studentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await getResponseErrorMessage(res));
      toast.success(t.deleteSuccessToast);
      onClose();
      await onSuccess();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, t.deleteFailed));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={() => !isDeleting && onClose()}
      title={t.removeStudentTitle}
      footer={
        <>
          <AdminButton
            variant="outline"
            onClick={onClose}
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
            onClick={() => void confirmDelete()}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
          >
            {isDeleting ? t.removing : t.removeStudentCta}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t.removeStudentBody}</p>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t.deleteConfirmPrompt}{" "}
            <span className="font-bold text-destructive">
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
                void confirmDelete();
              }
            }}
          />
        </div>
      </div>
    </AdminModal>
  );
}
