import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogIn,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { StudentProfile } from "../types";
import { saveStoredAuth } from "../utils/auth";

interface AdminLoginPageProps {
  onLoginSuccess?: (student: StudentProfile) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  let navigate: any = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = null;
  }

  const navigateTo = (path: string) => {
    if (navigate) {
      try {
        navigate(path, { replace: true });
        return;
      } catch (e) {
        // fallback
      }
    }
    window.location.href = path;
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (!email.trim()) {
      setErrorMsg("Please enter your admin email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your admin password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Admin login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      if (data.success && data.token) {
        // Create admin profile for compatibility with StudentProfile interface
        const adminProfile: StudentProfile = {
          id: data.adminId || "admin",
          studentId: data.adminId || "admin",
          rollNumber: "ADMIN",
          email: data.email || email.trim().toLowerCase(),
          phone: "",
          emailVerified: true,
          isVerified: true,
          registrationDate: new Date().toISOString(),
          name: "Administrator",
          department: "Administration",
          year: "N/A",
        };

        // Save authentication token with admin profile
        saveStoredAuth(data.token, adminProfile);

        // Show success state before redirect
        setIsSuccess(true);
        if (onLoginSuccess) {
          onLoginSuccess(adminProfile);
        }

        // Redirect to admin dashboard after 1.5 seconds
        setTimeout(() => {
          navigateTo("/admin");
        }, 1500);
      } else {
        setErrorMsg(data.error || "Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Admin login error:", err);
      setErrorMsg(err.message || "Connection error. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, Administrator!</h1>
          <p className="text-slate-400 mb-6">Authentication successful. Redirecting to dashboard...</p>
          <div className="flex justify-center">
            <div className="animate-spin">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">CampusCare</h1>
          </div>
          <h2 className="text-xl font-semibold text-blue-400 mb-1">Admin Portal</h2>
          <p className="text-slate-400 text-sm">Administrative Access Required</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@college.edu"
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Admin Login
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm mb-4">Access restricted to authorized administrators only.</p>
          <button
            onClick={() => navigateTo("/login")}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition"
          >
            Back to Student Login
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
