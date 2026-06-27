import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./ProtectedRoute.css";

const FRONTEND_LOGIN = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-loading">
        <div className="protected-loading-inner">
          <div className="protected-spinner" />
          <p className="protected-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = `${FRONTEND_LOGIN}/login`;
    return null;
  }

  return children;
};

export default ProtectedRoute;