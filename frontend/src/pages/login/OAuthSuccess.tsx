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

      refreshProfile()
        .then((profile) => {
          if (!profile) {
            navigate("/login", { replace: true });
            return;
          }

          if (isNewUser || (profile.name && profile.name.includes("@"))) {
            navigate("/google-username", { replace: true });
            return;
          }

          if (
            !profile.role ||
            profile.role === "choose" ||
            profile.role === "regular"
          ) {
            navigate("/register-preferences", { replace: true });
            return;
          }

          navigate("/catalog", { replace: true });
        })
        .catch((err) => {
          console.error("Помилка завантаження профілю:", err);
          navigate("/login", { replace: true });
        });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

  return <div className="p-10 text-center">Загрузка...</div>;
}
