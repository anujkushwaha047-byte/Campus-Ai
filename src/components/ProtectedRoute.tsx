import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { clearStoredAuth, getDashboardPath, getStoredAuth, AppRole } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [status, setStatus] = useState<"checking" | "verified" | "unauthenticated" | "error">("checking");
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let active = true;
    const session = getStoredAuth();
    if (!session) {
      setStatus("unauthenticated");
      return () => { active = false; };
    }

    fetch("/api/auth/session", {
      headers: { Authorization: `Bearer ${session.token}` },
    }).then(async (response) => {
      if (response.status === 401) {
        clearStoredAuth();
        if (active) setStatus("unauthenticated");
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to verify your session.");
      const verifiedRole = data.user?.role as string | undefined;
      if (!verifiedRole) throw new Error("The server returned an invalid session role.");
      const normalizedRole: AppRole = verifiedRole === "main_admin" || verifiedRole === "sector_admin"
        ? "admin"
        : verifiedRole === "warden" || verifiedRole === "staff"
          ? verifiedRole
          : "student";
      if (active) {
        setRole(normalizedRole);
        setStatus("verified");
      }
    }).catch((error: unknown) => {
      console.error("Failed to verify protected route session:", error);
      if (active) setStatus("error");
    });

    return () => { active = false; };
  }, []);

  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Verifying session...</div>;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }
  if (status === "error") {
    return <div role="alert" className="min-h-screen flex items-center justify-center text-sm text-rose-700">Unable to verify your session. Refresh the page or try again later.</div>;
  }
  if (!role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
};
