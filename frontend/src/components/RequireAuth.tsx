import { Navigate, Outlet, useLocation } from "react-router";
import { useUser } from "../context/UserContext";
import { EmailVerificationBanner } from "./EmailVerificationBanner";
import { learnerNeedsRoleSelection } from "../lib/learnerOnboarding";

export default function RequireAuth() {
  const { isLoggedIn, isLoading, user } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user && learnerNeedsRoleSelection(user.role)) {
    return <Navigate to="/register-details" replace />;
  }

  return (
    <>
      <EmailVerificationBanner />
      <Outlet />
    </>
  );
}
