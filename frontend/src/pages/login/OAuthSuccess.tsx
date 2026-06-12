import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const isNewUser = searchParams.get("isNewUser") === "true";

    if (token) {
      // Сохраняем токен (сразу оба варианта ключа, чтобы исключить опечатки в разных частях приложения)
      localStorage.setItem("explys_access_token", token);
      localStorage.setItem("exply_access_token", token);

      // Жесткая перезагрузка страницы решает проблему гонки React-контекстов.
      // Приложение запустится заново уже будучи уверенным, что токен есть.
      const targetUrl = isNewUser ? "/registrationDetails" : "/catalog";
      window.location.href = targetUrl;
    } else {
      console.warn("Токен не найден в URL!");
      window.location.href = "/loginForm";
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground text-sm font-medium">Authenticating...</p>
      </div>
    </div>
  );
}