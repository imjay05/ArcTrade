import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

import Signup from "./auth/signup/Signup";
import Login from "./auth/login/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import Home from "./components/home/Home";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: "0.88rem",
              borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            error: { iconTheme: { primary: "#e74c3c", secondary: "#fff" } },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}