import { Navigate, Outlet, useLocation } from "react-router";
import { useUser } from "../context/UserContext";
import { EmailVerificationBanner } from "./EmailVerificationBanner";

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
        to="/loginForm"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user && !user.role) {
    return <Navigate to="/registrationMain" replace />;
  }

  const isTeacher = user?.role?.toLowerCase() === "teacher" || user?.role?.toLowerCase() === "admin";
  if (user && !isTeacher && !user.dateOfBirth) {
    return <Navigate to="/registrationDetails" replace />;
  }

  return (
    <>
      <EmailVerificationBanner />
      <Outlet />
    </>
  );
}
