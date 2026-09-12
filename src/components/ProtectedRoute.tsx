import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getStoredAuth, getDashboardPath, AppRole } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const session = getStoredAuth();

  if (!session || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  const role = session.student.role === "main_admin" || session.student.role === "sector_admin"
    ? "admin"
    : (session.student.role || "student") as AppRole;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <>{children}</>;
};
