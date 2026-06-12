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

    if (token) {
      setStoredAccessToken(token);

      // Просто обновляем профиль и кидаем в каталог. 
      // Если юзер новый, RequireAuth сам его перехватит и отправит на регистрацию.
      refreshProfile().then(() => {
        navigate("/catalog", { replace: true });
      }).catch((err) => {
        console.error("Auth error:", err);
        navigate("/loginForm", { replace: true });
      });
    } else {
      navigate("/loginForm", { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

  return <div className="p-10 text-center">Загрузка...</div>;
}