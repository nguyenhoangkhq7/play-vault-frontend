import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/store/UserContext";

export default function RequireRole({ roles, children, redirectTo = "/login" }) {
  const { user, loading, hasRole } = useUser();

  if (loading) return null; // or a spinner

  if (!user) return <Navigate to={redirectTo} replace />;

  // roles can be a string or array
  if (hasRole(roles)) {
    return children || <Outlet />;
  }

  return <Navigate to="/" replace />;
}
