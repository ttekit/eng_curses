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

      refreshProfile().then(() => {
        if (isNewUser) {
          navigate("/registrationDetails", { replace: true });
        } else {
          navigate("/catalog", { replace: true });
        }
      });
    } else {
      navigate("/loginForm", { replace: true });
    }
  }, [navigate, searchParams, refreshProfile]);

  return <div className="h-screen w-full bg-background"></div>;
}