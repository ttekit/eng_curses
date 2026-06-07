import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { setStoredAccessToken } from "../../lib/api";
import { useUser } from "../../context/UserContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useUser();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    // Читаємо параметри з URL, які передав бекенд
    const token = searchParams.get("token");
    const isNewUser = searchParams.get("isNewUser") === "true";

    console.log("OAuth Debug:", { token: !!token, isNewUser }); // Додаємо лог для перевірки

    if (token) {
      // Зберігаємо токен
      setStoredAccessToken(token);

      // Завантажуємо профіль
      refreshProfile().then(() => {
        if (isNewUser) {
          // Якщо новий юзер -> на вибір ролі (Teacher/Student/Adult)
          navigate("/registrationDetails", { replace: true });
        } else {
          // Якщо старий юзер -> в каталог
          navigate("/catalog", { replace: true });
        }
      }).catch((err) => {
        console.error("Помилка завантаження профілю:", err);
        navigate("/loginForm", { replace: true });
      });
    } else {
      // Якщо токена в URL немає
      console.warn("Токен не знайдено в URL!");
      navigate("/loginForm", { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}