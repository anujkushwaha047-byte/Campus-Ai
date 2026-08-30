import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getStoredAuth } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = getStoredAuth();

  if (!session || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
