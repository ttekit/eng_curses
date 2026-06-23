import { useState } from "react";
import toast from "react-hot-toast";
import { LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { apiFetch, setStoredAccessToken } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import { useAppMessages } from "../../hooks/useAppMessages";
import { maskEmail } from "../../lib/formatters";
import { ProfileCard } from "./ProfileCard";
import { getErrorMessage } from "../../lib/error-message";

export function DangerZoneCard() {
  const { user, logout, refreshProfile } = useUser();
  const navigate = useNavigate();
  const s = useAppMessages().profileSettings;

  const isTeacherStudent =
    user?.role?.toLowerCase() === "student" &&
    Boolean(user?.teacherId || user?.teacherName);

  const [dangerCode, setDangerCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [dangerError, setDangerError] = useState("");
  const [dangerOpen, setDangerOpen] = useState<"reset" | "delete" | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDangerZone = async (action: "reset" | "delete") => {
    setIsSendingCode(true);
    try {
      const response = await apiFetch("/auth/send-danger-zone-code", {
        method: "POST",
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error("Failed to send code");

      setDangerOpen(action);
      setDangerCode("");
      setDangerError("");
      toast.success("A 6-digit code has been sent to your email.");
    } catch {
      toast.error("Could not send verification code.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetProgress = async () => {
    if (dangerCode.length !== 6) {
      return setDangerError("Please enter the 6-digit code.");
    }

    setIsResetting(true);
    setDangerError("");

    try {
      const response = await apiFetch("/users/profile/progress/reset", {
        method: "POST",
        body: JSON.stringify({ code: dangerCode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to reset progress");
      }

      toast.success("Progress reset successfully.");
      setDangerOpen(null);
      setDangerCode("");
      await refreshProfile();
    } catch (err: unknown) {
      setDangerError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (dangerCode.length !== 6) {
      return setDangerError("Please enter the 6-digit code.");
    }

    setIsDeleting(true);
    setDangerError("");

    try {
      const response = await apiFetch("/auth/delete-account", {
        method: "DELETE",
        body: JSON.stringify({ code: dangerCode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete account");
      }

      toast.success("Your account has been deleted.");
      logout();
      void navigate("/loginForm", { replace: true });
    } catch (err: unknown) {
      setDangerError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <ProfileCard
        title={
          <span className="flex items-center gap-2 text-destructive">
            <Shield className="size-5" />
            {s.cardDangerZone || "Danger Zone"}
          </span>
        }
        className="border-destructive/30"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-4 rounded-lg bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">
                {s.logoutTitle || "Sign Out"}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.logoutDesc || "Sign out of your account."}
              </p>
            </div>
            <div className="w-full flex justify-center sm:block sm:w-auto">
              <button
                type="button"
                className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-destructive/10 px-6 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 cursor-pointer"
                onClick={async () => {
                  try {
                    await apiFetch("/auth/logout", { method: "POST" });
                  } catch (e) {
                    console.error("Server logout request failed:", e);
                  }
                  logout();
                  setStoredAccessToken(null);
                  toast.success(s?.signOutToast || "Signed out successfully");
                  navigate("/loginForm", { replace: true });
                }}
              >
                <LogOut className="size-4 pt-1 pr-1" />
                {s.logoutCta || "Sign Out"}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-lg bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-foreground">
                {s.resetProgressTitle || "Reset Progress"}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.resetProgressDesc || "Reset your learning analytics."}
              </p>
            </div>
            <button
              type="button"
              className="flex w-full sm:w-auto justify-center items-center rounded-xl bg-destructive/10 px-6 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 cursor-pointer disabled:opacity-50"
              onClick={() => handleOpenDangerZone("reset")}
              disabled={isSendingCode}
            >
              {isSendingCode && dangerOpen !== "reset"
                ? "Sending..."
                : s.resetProgressCta || "Reset Progress"}
            </button>
          </div>

          {!isTeacherStudent && (
            <div className="flex flex-col gap-4 rounded-lg bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {s.deleteAccountTitle || "Delete Account"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {s.deleteAccountDesc || "Permanently delete your account."}
                </p>
              </div>
              <div className="flex justify-center sm:block">
                <button
                  type="button"
                  className="flex w-full sm:w-auto justify-center items-center rounded-xl bg-destructive px-6 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 cursor-pointer shadow-sm disabled:opacity-50"
                  onClick={() => handleOpenDangerZone("delete")}
                  disabled={isSendingCode}
                >
                  {isSendingCode && dangerOpen !== "delete"
                    ? "Sending..."
                    : s.deleteAccountCta || "Delete Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </ProfileCard>

      {/* Модальное окно */}
      {dangerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={() => {
            setDangerOpen(null);
            setDangerCode("");
            setDangerError("");
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              className={`text-xl font-bold ${dangerOpen === "delete" ? "text-red-500" : "text-foreground"}`}
            >
              {dangerOpen === "reset"
                ? s.dangerReset || "Reset Progress"
                : s.dangerDelete || "Delete Account"}
            </h4>

            <p className="mt-2 text-sm text-muted-foreground">
              {dangerOpen === "reset" ? s.dangerResetBody : s.dangerDeleteBody}
              <br />
              <br />
              {s.dangerCodeSent}
              <strong>{maskEmail(user?.email)}</strong>
              {s.dangerCodeEnter}
            </p>

            {dangerError && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                {dangerError}
              </div>
            )}

            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {s.dangerVerificationCode}{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                maxLength={6}
                value={dangerCode}
                onChange={(e) =>
                  setDangerCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="• • • • • •"
                autoFocus
                className="flex h-14 w-full rounded-lg border border-input bg-background px-4 py-2 text-2xl text-foreground text-center tracking-[0.5em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setDangerOpen(null);
                    setDangerCode("");
                    setDangerError("");
                  } else if (e.key === "Enter" && dangerCode.length === 6) {
                    void (dangerOpen === "reset"
                      ? handleResetProgress()
                      : handleDeleteAccount());
                  }
                }}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                onClick={() => {
                  setDangerOpen(null);
                  setDangerCode("");
                  setDangerError("");
                }}
              >
                {s.cancel}
              </button>
              <button
                type="button"
                onClick={
                  dangerOpen === "reset"
                    ? handleResetProgress
                    : handleDeleteAccount
                }
                disabled={
                  (dangerOpen === "reset" ? isResetting : isDeleting) ||
                  dangerCode.length !== 6
                }
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {dangerOpen === "reset"
                  ? isResetting
                    ? s.dangerResetting
                    : s.dangerResetBtn
                  : isDeleting
                    ? s.dangerDeleting
                    : s.dangerDeleteBtn}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
