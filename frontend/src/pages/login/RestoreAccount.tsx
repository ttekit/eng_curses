import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { AuthSplitLayout } from "../../components/AuthSplitLayout";
import Button from "../../components/Button";
import { apiFetch } from "../../lib/api";

export default function RestoreAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Токен відсутній. Перевірте посилання з листа.");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const restoreUser = async () => {
      try {
        const response = await apiFetch("/auth/restore-account", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Ваш акаунт успішно відновлено!");
        } else {
          setStatus("error");
          setMessage(data.message || "Недійсне або прострочене посилання.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Помилка з'єднання з сервером. Спробуйте пізніше.");
      }
    };

    restoreUser();
  }, [token]);

  return (
    <AuthSplitLayout
      rightTitle="Welcome back!"
      rightSubtitle="Ми раді, що ви змінили своє рішення та залишилися з нами."
    >
      <div className="mb-8 flex items-center gap-3">
        <img src="/Icon.svg" className="w-12 h-15" alt="Logo" />
        <h1 className="font-display text-2xl font-bold">Відновлення акаунту</h1>
      </div>

      <div className="space-y-6">
        {status === "loading" && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-medium animate-pulse">
            Відновлюємо ваш акаунт... Будь ласка, зачекайте.
          </div>
        )}

        {status === "success" && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
            {message}
          </div>
        )}

        <div className="pt-4">
          <Link to="/loginForm" className="block w-full">
            <Button
              type="button"
              className="w-full rounded-[15px] bg-primary px-6 py-4 text-sm font-semibold text-foreground/70 hover:bg-purple-hover hover:text-white transition-all shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
            >
              Перейти до входу
            </Button>
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
