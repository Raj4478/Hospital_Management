import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

/** Renders child routes only for signed-in users; everyone else goes to /login. */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "loading") return <FullPageLoader />;
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Keeps signed-in users away from the login and sign-up pages. */
export function GuestOnly() {
  const { status } = useAuth();
  if (status === "loading") return <FullPageLoader />;
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
