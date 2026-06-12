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

    console.log("OAuth Debug:", { token: !!token, isNewUser }); // Лог для перевірки

    if (token) {
      // Зберігаємо токен
      setStoredAccessToken(token);

      // Завантажуємо профіль та перевіряємо його дані
      refreshProfile()
        .then((profile) => {
          if (!profile) {
            navigate("/loginForm", { replace: true });
            return;
          }

          // 1. Если нет даты рождения (после Google регистрации) -> отправляем на экран ввода DOB
          if (!profile.dateOfBirth) {
            navigate("/onboarding/dob", { replace: true });
            return;
          }

          // 2. Если дата рождения есть, но юзер новый или не выбрал роль -> на детали регистрации
          if (
            isNewUser ||
            !profile.role ||
            profile.role === "choose" ||
            profile.role === "regular"
          ) {
            navigate("/registrationDetails", { replace: true });
            return;
          }

          // 3. Если старый юзер и всё заполнено -> в каталог
          navigate("/catalog", { replace: true });
        })
        .catch((err) => {
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
