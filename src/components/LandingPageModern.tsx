import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Shield } from "lucide-react";

const LandingPageModern: React.FC = () => {
  const [rollNumber, setRollNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber || !otp) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, otp })
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/dashboard");
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-[#E5EAF1] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Campus-Ai</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {/* Navigation links could be added here */}
        </div>
        <button
          className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-[#146EF5] text-white text-sm font-semibold rounded-xl hover:bg-[#0F5CCB] transition-colors shadow-lg shadow-blue-500/25"
        >
          <Lock className="w-4 h-4" />
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-3">
              Your Smarter Campus
              <span className="bg-gradient-to-r from-[#146EF5] to-[#3B82F6] bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Campus-Ai brings students, faculty, and campus services together in one intelligent platform.
            </p>
          </div>

          {/* OTP Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g., 2022CSB1044"
                className="w-full px-4 py-2.5 border border-[#E5EAF1] rounded-xl text-slate-900 focus:ring-[#146EF5] focus:border-[#146EF5] bg-[#F7F9FC]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxlength="6"
                className="w-full px-4 py-2.5 border border-[#E5EAF1] rounded-xl text-slate-900 focus:ring-[#146EF5] focus:border-[#146EF5] bg-[#F7F9FC]"
              />
            </div>

            {error && <p className="text-sm text-[#146EF5] font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-[#146EF5] text-white text-base font-semibold rounded-xl hover:bg-[#0F5CCB] transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Verify OTP & Continue
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-700">Demo Accounts:</strong> Use roll numbers like{" "}
              <code className="bg-white px-1.5 py-0.5 rounded text-[#146EF5] font-mono">23AIML001</code>{" "}
              or{" "} <code className="bg-white px-1.5 py-0.5 rounded text-[#146EF5] font-mono">2022CSB1044</code>{" "}
              with college email ending in{" "}
              <code className="bg-white px-1.5 py-0.5 rounded text-[#146EF5] font-mono">.edu.in</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPageModern;