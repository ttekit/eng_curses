import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { apiFetch } from "../../lib/api";
import { useLandingLocale } from "../../context/LandingLocaleContext";
//наверн надо просто удалить его
export default function EmailConfirmedPage() {
  const { messages } = useLandingLocale();
  const t = messages.auth.emailLinkConfirm;
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
    token ? "loading" : "error",
  );
  const token = searchParams.get("token");
  const initialized = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (initialized.current) return;
    initialized.current = true;

    const confirmEmail = async () => {
      try {
        const response = await apiFetch(
          `/auth/confirm-email?token=${encodeURIComponent(token)}`,
          { method: "GET" },
        );

        if (response.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Email confirmation error:", error);
        setStatus("error");
      }
    };

    void confirmEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f111a] text-white">
      <div className="text-center p-8 bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl max-w-md mx-auto">
        {status === "loading" && (
          <p className="text-gray-400 animate-pulse">{t.loading}</p>
        )}

        {status === "success" && (
          <>
            <div className="bg-green-500/20 text-green-400 inline-flex size-16 items-center justify-center rounded-full text-3xl font-bold mb-6">
              ✓
            </div>
            <h1 className="text-3xl font-bold mb-4">{t.successTitle}</h1>
            <p className="text-gray-400 mb-8">{t.successBody}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-red-500/20 text-red-400 inline-flex size-16 items-center justify-center rounded-full text-3xl font-bold mb-6">
              ✕
            </div>
            <h1 className="text-3xl font-bold mb-4">{t.errorTitle}</h1>
            <p className="text-gray-400 mb-8">{t.errorBody}</p>
          </>
        )}

        <button
          onClick={() => (window.location.href = "/login")}
          className="px-8 py-3 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl font-semibold transition-colors w-full"
        >
          {t.goToLogin}
        </button>
      </div>
    </div>
  );
}
