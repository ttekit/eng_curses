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

    const token = searchParams.get("token");
    const isNewUser = searchParams.get("isNewUser") === "true";


    if (token) {
      setStoredAccessToken(token);

      // Завантажуємо профіль та перевіряємо його дані
      refreshProfile()
        .then((profile) => {
          if (!profile) {
            navigate("/loginForm", { replace: true });
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
      navigate("/loginForm", { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

  return <div className="p-10 text-center">Загрузка...</div>;
}
