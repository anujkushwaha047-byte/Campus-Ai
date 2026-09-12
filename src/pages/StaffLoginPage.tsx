import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { saveStoredAuth, getDashboardPath } from "../utils/auth";
import { StudentProfile } from "../types";

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("warden@college.edu");
  const [password, setPassword] = useState("warden123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.staff || !data.token) throw new Error(data.error || "Staff login failed.");
      saveStoredAuth(data.token, data.staff as StudentProfile);
      navigate(getDashboardPath(data.staff.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Staff login failed.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <form onSubmit={submit} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
      <div className="flex items-center gap-3"><ShieldCheck className="text-blue-600" /><div><h1 className="text-xl font-bold">Staff Login</h1><p className="text-xs text-slate-500">Warden and department access</p></div></div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Staff email" className="w-full p-3 rounded-xl border border-slate-200" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-xl border border-slate-200" />
      <button disabled={loading} className="w-full p-3 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button>
    </form>
  </div>;
};
