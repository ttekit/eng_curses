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
<<<<<<< HEAD
    const isNewUser = searchParams.get("isNewUser") === "true";

    console.log("OAuth Debug:", { token: !!token, isNewUser }); // Лог для перевірки
=======
>>>>>>> acb8fc26d59286259a9b10c0b81cb461f1287cdd

    if (token) {
      setStoredAccessToken(token);

<<<<<<< HEAD
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
=======
      // Просто обновляем профиль и кидаем в каталог. 
      // Если юзер новый, RequireAuth сам его перехватит и отправит на регистрацию.
      refreshProfile().then(() => {
        navigate("/catalog", { replace: true });
      }).catch((err) => {
        console.error("Auth error:", err);
        navigate("/loginForm", { replace: true });
      });
>>>>>>> acb8fc26d59286259a9b10c0b81cb461f1287cdd
    } else {
      navigate("/loginForm", { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

<<<<<<< HEAD
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
=======
  return <div className="p-10 text-center">Загрузка...</div>;
}
>>>>>>> acb8fc26d59286259a9b10c0b81cb461f1287cdd
