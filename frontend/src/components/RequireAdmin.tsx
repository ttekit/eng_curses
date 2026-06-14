import { Navigate, Outlet } from "react-router";
import { useUser } from "../context/UserContext";
import { useAppMessages } from "../hooks/useAppMessages";

/**
 * Restricts `/admin/*` to authenticated users whose profile role is `admin`.
 */
export default function RequireAdmin() {
  const { user, isLoading } = useUser();
  const common = useAppMessages().common;

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">{common.loading}</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/catalog" replace />;
  }

  return <Outlet />;
}
