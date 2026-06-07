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

    console.log("OAuth Debug:", { token: !!token, isNewUser });

    if (token) {
      setStoredAccessToken(token);

      refreshProfile().then(() => {
        if (isNewUser) {
          navigate("/registrationDetails", { replace: true });
        } else {
          navigate("/catalog", { replace: true });
        }
      }).catch((err) => {
        console.error("Помилка завантаження профілю:", err);
        navigate("/loginForm", { replace: true });
      });
    } else {
      navigate("/loginForm", { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}