import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Phone,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Clock,
  Building2,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Layers,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Info,
  Zap,
  UserCheck
} from "lucide-react";
import { StudentProfile } from "../types";
import { saveStoredAuth, isAuthenticated } from "../utils/auth";

interface LoginPageProps {
  onLoginSuccess: (student: StudentProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [rollNumber, setRollNumber] = useState("23AIML001");
  const [email, setEmail] = useState("student@college.edu.in");
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [verifiedStudent, setVerifiedStudent] = useState<StudentProfile | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // 1-Click Instant Demo Login
  const handleInstantDemoLogin = async (demoRoll = "23AIML001", demoEmail = "student@college.edu.in", demoPhone = "9876543210") => {
    setErrorMsg("");
    setIsDemoLoggingIn(true);
    try {
      const sendRes = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: demoRoll,
          email: demoEmail,
          phone: demoPhone,
        }),
      });
      const sendData = await sendRes.json();
      const codeToUse = sendData.demoOtp || "123456";

      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: demoRoll,
          email: demoEmail,
          phone: demoPhone,
          otp: codeToUse,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.success && verifyData.student) {
        setVerifiedStudent(verifyData.student);
        setStep("success");
        const token = verifyData.token || `auth_token_demo_${Date.now()}`;
        saveStoredAuth(token, verifyData.student);

        setTimeout(() => {
          onLoginSuccess(verifyData.student);
          navigate("/dashboard", { replace: true });
        }, 800);
      } else {
        setErrorMsg(verifyData.error || "Demo authentication failed. Please try standard login.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server for demo login.");
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  // Step 1: Submit Student Details & Request OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, "");

    // 1. Roll Number Validation
    if (!cleanRoll) {
      setErrorMsg("Please enter your University / College Roll Number.");
      return;
    }

    // 2. Email Validation
    if (!cleanEmail) {
      setErrorMsg("Please enter your official college email address.");
      return;
    }
    const isValidDomain =
      cleanEmail.endsWith(".edu.in") ||
      cleanEmail.endsWith("@campus.edu") ||
      cleanEmail.endsWith("@college.edu.in");

    if (!isValidDomain) {
      setErrorMsg(
        "Please use your official college email address ending with .edu.in (e.g. student@college.edu.in). Personal emails (@gmail.com) are not permitted."
      );
      return;
    }

    // 3. Phone Validation (10 digits)
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number (digits only, e.g. 9876543210).");
      return;
    }

    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: cleanRoll,
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.maskedEmail);
        setDemoCode(data.demoOtp || "123456");
        setStep("otp");
        setCountdown(30);
        // Pre-fill demo OTP code for seamless testing
        if (data.demoOtp) {
          setOtp(data.demoOtp.split(""));
        }
      } else {
        setErrorMsg(data.error || "Failed to send verification code. Please check your credentials.");
      }
    } catch (err) {
      setErrorMsg("Network connection error. Please verify the server is running.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Handle OTP input typing & auto-advance
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`login-otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 2: Verify OTP & Log In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMsg("Please enter the full 6-digit verification code.");
      return;
    }

    setErrorMsg("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: rollNumber.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          phone: phone.trim().replace(/\D/g, ""),
          otp: fullOtp,
        }),
      });

      const data = await res.json();
      if (data.success && data.student) {
        setVerifiedStudent(data.student);
        setStep("success");

        // Save session in localStorage
        const token = data.token || `auth_token_${Date.now()}`;
        saveStoredAuth(token, data.student);

        setTimeout(() => {
          onLoginSuccess(data.student);
          navigate("/dashboard", { replace: true });
        }, 1000);
      } else {
        setErrorMsg(data.error || "Invalid verification code. Please check and try again.");
      }
    } catch (err) {
      setErrorMsg("Verification request failed. Please check network connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Preset demo student credentials
  const fillPreset = (roll: string, em: string, ph: string) => {
    setRollNumber(roll);
    setEmail(em);
    setPhone(ph);
    setErrorMsg("");
  };

  const scrollToInfo = () => {
    const el = document.getElementById("public-info-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E5EAF1] sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                Campus-Ai
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#146EF5] border border-blue-200">
                Official Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI-Powered University Grievance Redressal &amp; SLA Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={scrollToInfo}
            className="text-xs font-bold text-slate-600 hover:text-[#146EF5] transition-colors flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <Info className="w-4 h-4 text-[#146EF5]" />
            <span className="hidden sm:inline">Platform Information &amp; FAQs</span>
            <span className="sm:hidden">About</span>
          </button>
          
          <button
            onClick={() => handleInstantDemoLogin()}
            disabled={isDemoLoggingIn || isSendingOtp}
            className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Instant access with pre-configured student demo account"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span className="hidden sm:inline">Quick Demo Login</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN LOGIN HERO SECTION */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* LEFT PANEL: Branding & Visuals */}
          <div className="lg:col-span-5 bg-[#061B3A] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Gradient Glows */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Brand Emblem */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xl text-white tracking-tight">Campus-Ai</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      AI
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Student &amp; Staff Portal</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  Smart Grievance Resolution &amp; Student Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Log in with your official college credentials to submit grievances, monitor AI urgency triage, and track real-time resolution timelines.
                </p>
              </div>

              {/* 3-Step Flow Indicator */}
              <div className="bg-[#09254A]/90 border border-[#0F356B] rounded-2xl p-4 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Authentication Process
                </div>
                <div className="space-y-2.5 text-xs">
                  <div
                    className={`flex items-center gap-2.5 ${
                      step === "details" ? "text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step === "details"
                          ? "bg-[#146EF5] text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {step !== "details" ? "✓" : "1"}
                    </div>
                    <span>1. Student Details (Roll No, .edu.in Email, Phone)</span>
                  </div>

                  <div
                    className={`flex items-center gap-2.5 ${
                      step === "otp" ? "text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step === "otp"
                          ? "bg-[#146EF5] text-white"
                          : step === "success"
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {step === "success" ? "✓" : "2"}
                    </div>
                    <span>2. OTP Email Verification (5 min validity)</span>
                  </div>

                  <div
                    className={`flex items-center gap-2.5 ${
                      step === "success" ? "text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step === "success" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      3
                    </div>
                    <span>3. Personalized Student Dashboard</span>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>AI Automated Priority &amp; Sentiment Triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>End-to-End Encrypted .edu.in Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Live SLA Timelines &amp; Direct Admin Redressal</span>
                </div>
              </div>
            </div>

            {/* Footer Security Badge */}
            <div className="pt-6 mt-6 border-t border-[#09254A] flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                University Official Subdomain
              </span>
              <span className="font-mono text-slate-500">v2.4 Live Engine</span>
            </div>
          </div>

          {/* RIGHT PANEL: Interactive Authentication Forms */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
            <div>
              {/* Step indicator header */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-[11px] uppercase tracking-wider">
                  {step === "details"
                    ? "Step 1 of 2: Enter Student Info"
                    : step === "otp"
                    ? "Step 2 of 2: OTP Verification"
                    : "Authentication Complete"}
                </span>
                <span className="text-xs text-slate-400">CampusCare Portal</span>
              </div>

              {/* ERROR BANNER */}
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {/* STEP 1: CREDENTIALS (ROLL NO + EMAIL + PHONE) */}
              {step === "details" && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Student Identity Login
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your university roll number, official <code className="text-[#146EF5] font-semibold">.edu.in</code> email, and 10-digit phone number.
                    </p>
                  </div>

                  {/* Quick Demo Fill Pill Bar */}
                  <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-[#E5EAF1] space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Quick Test Accounts (.edu.in)</span>
                      <span className="text-[#146EF5]">Click to auto-fill</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillPreset("23AIML001", "student@college.edu.in", "9876543210")}
                        className="px-2.5 py-1 bg-white border border-[#E5EAF1] hover:border-[#146EF5] hover:text-[#146EF5] rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                      >
                        23AIML001 (student@college.edu.in)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillPreset("2022CSB1044", "rahul.sharma@campus.edu.in", "9876543210")}
                        className="px-2.5 py-1 bg-white border border-[#E5EAF1] hover:border-[#146EF5] hover:text-[#146EF5] rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                      >
                        Rahul Sharma (2022CSB1044)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillPreset("2023ECE052", "aman.verma@college.edu.in", "9123456780")}
                        className="px-2.5 py-1 bg-white border border-[#E5EAF1] hover:border-[#146EF5] hover:text-[#146EF5] rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                      >
                        Aman Verma (2023ECE052)
                      </button>
                    </div>
                  </div>

                  {/* 1. Roll Number Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      1. College Roll Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. 23AIML001 or 2022CSB1044"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* 2. College Email ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        2. Official College Email <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] font-semibold text-[#146EF5] bg-blue-50 px-1.5 py-0.5 rounded">
                        Must end with .edu.in
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@college.edu.in"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* 3. Phone Number (10 digits) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      3. Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-mono text-xs">
                        <Phone className="w-3.5 h-3.5" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        className="w-full pl-16 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5] focus:outline-none transition tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={isSendingOtp || isDemoLoggingIn}
                      className="w-full py-3.5 bg-[#146EF5] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Validating Credentials &amp; Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Validate &amp; Send OTP Verification</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantDemoLogin(rollNumber || "23AIML001", email || "student@college.edu.in", phone || "9876543210")}
                      disabled={isSendingOtp || isDemoLoggingIn}
                      className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60 shadow-2xs"
                    >
                      {isDemoLoggingIn ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                          <span>Authenticating Demo Account...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                          <span>Instant Demo Login (1-Click)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      Verify Your College Email
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      We have dispatched a 6-digit verification code to your official email:
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[#146EF5] font-mono text-xs font-bold">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{maskedEmail || email}</span>
                    </div>
                  </div>

                  {/* Demo Helper Banner */}
                  {demoCode && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          Verification Code:{" "}
                          <strong className="font-mono text-amber-900 text-sm font-bold ml-1">
                            {demoCode}
                          </strong>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(demoCode.split(""))}
                        className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded text-xs cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  {/* 6 Digit OTP Input Boxes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`login-otp-box-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl text-slate-900 bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5] focus:ring-2 focus:ring-blue-100 focus:outline-none transition shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Action Button */}
                  <button
                    type="submit"
                    disabled={isVerifying || otp.join("").length < 6}
                    className="w-full py-3.5 bg-[#146EF5] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying &amp; Logging In...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify &amp; Enter Campus-Ai Dashboard</span>
                      </>
                    )}
                  </button>

                  {/* Resend OTP and Change Details */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("details");
                        setErrorMsg("");
                      }}
                      className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      ← Edit Student Details
                    </button>

                    <div>
                      {countdown > 0 ? (
                        <span className="text-slate-400">
                          Resend code in <strong className="text-slate-700">{countdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="text-[#146EF5] hover:underline font-bold cursor-pointer"
                        >
                          Resend OTP Code
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}

              {/* STEP 3: SUCCESS TRANSITION */}
              {step === "success" && (
                <div className="py-12 text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Authentication Successful!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Welcome, <strong>{verifiedStudent?.name || "Student"}</strong> (
                      {verifiedStudent?.rollNumber}).
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                      Session verified. Redirecting to your Campus-Ai Dashboard...
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-[#146EF5] font-semibold pt-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading Grievance Dashboard...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy & Anti-Spam Notice */}
            <div className="pt-6 border-t border-[#E5EAF1] text-center text-[11px] text-slate-400">
              Campus complaints and student records are strictly secured under University Privacy Rules and routed automatically to departmental ombudsmen.
            </div>
          </div>
        </div>
      </main>

      {/* 3. PUBLIC INFORMATION SECTION */}
      <section id="public-info-section" className="bg-white border-t border-[#E5EAF1] py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* SECTION A: What is Campus-Ai? */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-xs uppercase tracking-wider border border-blue-200">
              About The Platform
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              What is Campus-Ai?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Campus-Ai is the official, intelligent grievance redressal and campus management platform engineered for universities and collegiate institutions. It bridges students, faculty, and administrative departments through AI-driven triage, transparent SLA tracking, and real-time resolution workflows.
            </p>
          </div>

          {/* SECTION B: How the Platform Works (4-Step Workflow) */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                How Campus-Ai Works
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                From issue submission to final resolution, every grievance is tracked transparently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-3 relative group hover:border-[#146EF5] transition">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#146EF5] font-bold flex items-center justify-center text-sm shadow-xs">
                  01
                </div>
                <h4 className="font-bold text-base text-slate-900">Submit Grievance</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students log in with their verified .edu.in credentials and submit issues with location tags, category specifications, and optional image attachments.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-3 relative group hover:border-[#146EF5] transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm shadow-xs">
                  02
                </div>
                <h4 className="font-bold text-base text-slate-900">AI Priority Triage</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our embedded AI engine analyzes urgency, sentiment, and safety hazards, assigning an instant priority score and SLA timeline.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-3 relative group hover:border-[#146EF5] transition">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-sm shadow-xs">
                  03
                </div>
                <h4 className="font-bold text-base text-slate-900">Department Routing</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The grievance is routed directly to the designated department officer (Hostel Warden, Dean of Academics, IT Support Desk).
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-3 relative group hover:border-[#146EF5] transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm shadow-xs">
                  04
                </div>
                <h4 className="font-bold text-base text-slate-900">Verified Resolution</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Administrators post resolution notes and timeline updates. Students track progress live and receive automatic status notifications.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION C: Key Platform Features */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Key Platform Features
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Built specifically for student welfare, quick resolution, and institutional accountability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#146EF5] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">AI Priority &amp; Sentiment Triage</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Automatically detects emergency hazards (such as electrical or water safety issues) and flags them for immediate critical resolution.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Verified .edu.in Identity</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Multi-factor authentication ensures only legitimate enrolled students can submit tickets, eliminating spam.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Live SLA Timelines</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every stage of review, assignment, and resolution is timestamped in a verifiable institutional audit log.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Departmental Segregation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Granular categories for Hostels, Faculty, Library, Examination Cell, IT Infrastructure, and Campus Sanitation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Institutional Analytics</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Super administrators monitor resolution benchmarks, average turnaround times, and recurrence trends across blocks.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Direct Officer Notes</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Officers and students can exchange real-time updates and clarification notes directly within the grievance card.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION D: About Us & Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#E5EAF1]">
            <div className="space-y-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#146EF5]" />
                About Us &amp; Governance
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Campus-Ai is deployed under the mandate of the University Grievance Redressal Committee (SGRC) to uphold transparency, rapid student support, and academic excellence. All administrative decisions and AI triage parameters adhere strictly to institutional regulations.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Credits &amp; Development
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Designed &amp; Developed for the University Student Council &amp; Campus Administration. Powered by Google Gemini AI and the Campus-Ai High-Performance Engine.
              </p>
            </div>
          </div>

          {/* SECTION E: Contact Information & Emergency Helpdesk */}
          <div id="contact-section" className="bg-[#061B3A] text-white rounded-3xl p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Support &amp; Assistance
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  University Grievance Redressal Helpdesk
                </h3>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-4 py-2 bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Back to Login Form ↑
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#09254A] text-xs">
              <div className="space-y-1.5">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Official Email Desk</div>
                <div className="font-mono text-slate-200 text-sm">grievance-desk@campus.edu.in</div>
                <div className="text-slate-400">support@campuscare.edu.in</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Emergency Campus Helpline</div>
                <div className="font-mono text-slate-200 text-sm">+91 (011) 2345-6789</div>
                <div className="text-slate-400">Toll Free: 1800-CAMPUS-CARE</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Office &amp; Walk-in Hours</div>
                <div className="text-slate-200 font-semibold">Admin Block, 1st Floor, Room 102</div>
                <div className="text-slate-400">Mon – Sat: 9:00 AM – 5:30 PM</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-[#040E1E] text-slate-400 py-8 px-4 sm:px-8 text-xs border-t border-[#09254A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#146EF5]" />
            <span className="font-bold text-white">Campus-Ai</span>
            <span>— Official Student Grievance System</span>
          </div>

          <div className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Campus-Ai. All Rights Reserved. Protected under University Privacy &amp; Anti-Ragging Statutes.
          </div>
        </div>
      </footer>
    </div>
  );
};
