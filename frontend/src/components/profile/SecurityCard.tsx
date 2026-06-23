import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import { useAppMessages } from "../../hooks/useAppMessages";
import { maskEmail } from "../../lib/formatters";
import { ProfileCard } from "./ProfileCard";
import { ToggleSwitch } from "./ToggleSwitch";
import { getErrorMessage } from "../../lib/error-message";

export function SecurityCard() {
  const { user, refreshProfile } = useUser();
  const s = useAppMessages().profileSettings;

  const isTeacherStudent =
    user?.role?.toLowerCase() === "student" &&
    Boolean(user?.teacherId || user?.teacherName);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [, setIsChangeEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const [emailChangeStep, setEmailChangeStep] = useState<1 | 2>(1);
  const [emailChangeCode, setEmailChangeCode] = useState("");

  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [target2FAState, setTarget2FAState] = useState(false);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsChangingPassword(false);
        setIsChangingEmail(false);
        setIsToggling2FA(false);
        setError("");
      }
    };

    if (isChangingPassword || isChangingEmail || isToggling2FA) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChangingPassword, isChangingEmail, isToggling2FA]);

  const handleToggle2FAClick = (checked: boolean) => {
    setTarget2FAState(checked);
    setTwoFactorPassword("");
    setError("");
    setIsToggling2FA(true);
  };

  const handleConfirm2FAToggle = async () => {
    if (!twoFactorPassword) {
      setError("Please enter your current password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiFetch("/auth/toggle-2fa", {
        method: "POST",
        body: JSON.stringify({
          enable: target2FAState,
          password: twoFactorPassword,
        }),
      });

      if (response.ok) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await refreshProfile();
        setIsToggling2FA(false);
        setTwoFactorPassword("");
        toast.success(
          target2FAState
            ? "Two-factor authentication enabled"
            : "Two-factor authentication disabled",
        );
      } else {
        const data = await response.json();
        setError(data.message || "Invalid password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    setError("");

    if (emailChangeStep === 1) {
      if (emailChangeCode.length !== 6) {
        return setError("Please enter the 6-digit code.");
      }

      setIsLoading(true);
      try {
        const response = await apiFetch("/auth/check-email-change-code", {
          method: "POST",
          body: JSON.stringify({ code: emailChangeCode }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Invalid code");
        }

        setEmailChangeStep(2);
        setError("");
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Something went wrong"));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!newEmail || !confirmNewEmail)
      return setError("Please fill in all email fields.");
    if (newEmail !== confirmNewEmail) return setError("Emails do not match.");

    setIsLoading(true);
    try {
      const response = await apiFetch("/auth/verify-email-change", {
        method: "POST",
        body: JSON.stringify({
          code: emailChangeCode,
          newEmail: newEmail,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.message || "Failed to update email");

      toast.success("Email successfully updated!");
      await refreshProfile();
      setIsChangingEmail(false);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEmailChange = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiFetch("/auth/send-email-change-code", {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send verification code");
      }

      setEmailChangeStep(1);
      setEmailChangeCode("");
      setNewEmail("");
      setConfirmNewEmail("");
      setIsChangingEmail(true);

      toast.success("Verification code sent to your current email!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch("/auth/update-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Invalid current password or server error."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <ProfileCard
      title={
        <span className="flex items-center gap-2">
          <Lock className="size-5" />
          {s.securityLogin}
        </span>
      }
    >
      <div className="space-y-4">
        {!isTeacherStudent && (
          <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors">
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                <div>
                  <p className="font-medium text-foreground text-left">
                    {s.email}
                  </p>
                  <button
                    onClick={() => setIsChangeEmailModalOpen(true)}
                    className="text-sm text-muted-foreground text-left hover:underline transition-colors"
                  >
                    {maskEmail(user?.email)}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStartEmailChange}
                className="shrink-0 rounded-xl px-5 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                {s.changeEmail}
              </button>

              {isChangingEmail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-2xl rounded-2xl border border-border bg-card text-foreground shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="flex items-start justify-between p-8 pb-6">
                      <div>
                        <h2 className="text-3xl font-bold">{s.updateEmail}</h2>
                        <p className="text-base text-muted-foreground mt-2">
                          {emailChangeStep === 1
                            ? `${s.sendCode} ${maskEmail(user?.email)} ${s.enterBelow}`
                            : s.enterNewEmail}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsChangingEmail(false)}
                        className="p-1 rounded-sm text-muted-foreground hover:cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="p-8 pt-0 space-y-5">
                      {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                          {error}
                        </div>
                      )}

                      {emailChangeStep === 1 ? (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {s.verCode} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={emailChangeCode}
                            onChange={(e) =>
                              setEmailChangeCode(
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            placeholder="• • • • • •"
                            autoFocus
                            className="flex h-14 w-full rounded-lg border border-input bg-background px-4 py-2 text-2xl text-foreground text-center tracking-[0.5em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {s.newEmail}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              autoFocus
                              className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              {s.confirmEmail}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={confirmNewEmail}
                              onChange={(e) =>
                                setConfirmNewEmail(e.target.value)
                              }
                              onPaste={(e) => e.preventDefault()}
                              className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 px-8 flex items-center justify-end gap-4 rounded-b-2xl bg-muted/30 border-t border-border">
                      <button
                        onClick={() => setIsChangingEmail(false)}
                        className="px-5 py-3 text-sm font-medium hover:underline hover:cursor-pointer"
                      >
                        {s.cancel}
                      </button>
                      <button
                        onClick={handleEmailUpdate}
                        disabled={
                          isLoading ||
                          (emailChangeStep === 1 &&
                            emailChangeCode.length !== 6)
                        }
                        className="flex rounded-[15px] bg-primary px-6 py-2 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
                      >
                        {isLoading
                          ? s.processing
                          : emailChangeStep === 1
                            ? s.next
                            : s.done}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
            <div>
              <p className="font-medium text-foreground text-left">
                {s.password}
              </p>
              <p className="text-sm text-muted-foreground text-left">
                {s.updatePassToKeep}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="shrink-0 rounded-xl px-5 py-2 text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {s.changePass}
            </button>
          </div>

          {isChangingPassword && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-2xl rounded-2xl border border-border bg-card text-foreground shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between p-8 pb-6">
                  <div>
                    <h2 className="text-3xl font-bold">{s.updatePass}</h2>
                    <p className="text-base text-muted-foreground mt-2">
                      {s.enterCurrent}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setError("");
                    }}
                    className="p-1 rounded-sm text-muted-foreground hover:cursor-pointer hover:bg-muted-foreground/10 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-8 pt-0 space-y-7">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                      {s.currentPass} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="flex h-12 w-full mt-3 rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                      {s.newPass} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex h-12 w-full mt-3 rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground tracking-wider">
                      {s.confirmPass} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex h-12 w-full mt-3 rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                    />
                  </div>
                </div>

                <div className="p-3 px-8 flex items-center justify-end gap-4 rounded-b-2xl bg-muted/30 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setError("");
                    }}
                    disabled={isLoading}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    {s.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordUpdate}
                    disabled={isLoading}
                    className="flex items-center justify-center rounded-[15px] bg-primary px-6 py-2 text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50 shadow-[inset_0_0_20px_4px_rgba(255,255,255,0.85)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)] hover:bg-purple-hover"
                  >
                    {isLoading ? s.saving : "Done"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20 transition-colors">
          <div>
            <p className="font-medium text-foreground">{s.twoFactor}</p>
            <p className="text-sm text-muted-foreground">{s.extraLayer}</p>
          </div>

          <ToggleSwitch
            key={`${user?.isTwoFactorEnable}-${isToggling2FA}`}
            checked={!!user?.isTwoFactorEnable}
            onCheckedChange={handleToggle2FAClick}
          />

          {isToggling2FA && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-2xl rounded-2xl border border-border bg-card text-foreground shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between p-8 pb-6">
                  <div>
                    <h2 className="text-3xl font-bold">
                      {target2FAState ? "Enable" : "Disable"} 2FA
                    </h2>
                    <p className="text-base text-muted-foreground mt-2">
                      Please enter your password to confirm this change.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsToggling2FA(false);
                      setError("");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-8 pt-0 space-y-7">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                      {error}
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="mb-4 block text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      className="hidden"
                    />
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={twoFactorPassword}
                      onChange={(e) => setTwoFactorPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoFocus
                      className="flex h-14 w-full rounded-lg border border-input bg-background px-4 py-3 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setIsToggling2FA(false);
                          setError("");
                        } else if (
                          e.key === "Enter" &&
                          twoFactorPassword &&
                          !isLoading
                        ) {
                          e.preventDefault();
                          void handleConfirm2FAToggle();
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="p-6 px-8 flex items-center justify-end gap-4 rounded-b-2xl bg-muted/30 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsToggling2FA(false);
                      setError("");
                    }}
                    disabled={isLoading}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {s.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm2FAToggle}
                    disabled={isLoading || !twoFactorPassword}
                    className="rounded-xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? "Confirming..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProfileCard>
  );
}
