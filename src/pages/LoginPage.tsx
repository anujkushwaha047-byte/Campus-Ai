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
  GraduationCap,
  FileText,
  UserCheck,
  Users,
  Code2,
  Cpu,
  Server,
  Database,
  Award,
  Globe,
  MapPin,
  Send,
  SlidersHorizontal,
  ChevronRight,
  Star
} from "lucide-react";
import { StudentProfile } from "../types";
import { saveStoredAuth, isAuthenticated } from "../utils/auth";
import {
  COLLEGE_INFORMATION,
  COLLEGE_DIRECTORY,
  TEAM_MEMBERS,
  PROJECT_CREDITS,
  OFFICIAL_SOURCE_URLS
} from "../collegeData";

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
        if (data.demoOtp) {
          setOtp(data.demoOtp.split(""));
        }
      } else {
        setErrorMsg(data.error || "Failed to send verification code. Please check your credentials.");
      }
    } catch (err) {
      setErrorMsg("Network connection error. Please verify the backend server is running.");
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

        const token = data.token || `auth_token_${Date.now()}`;
        saveStoredAuth(token, data.student);

        setTimeout(() => {
          onLoginSuccess(data.student);
          navigate("/dashboard", { replace: true });
        }, 900);
      } else {
        setErrorMsg(data.error || "Invalid verification code. Please check and try again.");
      }
    } catch (err) {
      setErrorMsg("Verification request failed. Please check your network connection.");
    } finally {
      setIsVerifying(false);
    }
  };

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

  // Preset demo student credentials filler
  const fillPreset = (roll: string, em: string, ph: string) => {
    setRollNumber(roll);
    setEmail(em);
    setPhone(ph);
    setErrorMsg("");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E5EAF1] sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                CampusCare
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-[#146EF5] border border-blue-200">
                AIML Project
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI-Powered Campus Complaint Management · I.T.S Engineering College
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
          <button
            onClick={() => scrollToSection("features-section")}
            className="hover:text-[#146EF5] transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("about-section")}
            className="hover:text-[#146EF5] transition-colors cursor-pointer"
          >
            About Project
          </button>
          <button
            onClick={() => scrollToSection("team-section")}
            className="hover:text-[#146EF5] transition-colors cursor-pointer"
          >
            Meet the Team
          </button>
          <button
            onClick={() => scrollToSection("guidance-section")}
            className="hover:text-[#146EF5] transition-colors cursor-pointer"
          >
            Guidance &amp; College
          </button>
          <button
            onClick={() => scrollToSection("contact-section")}
            className="hover:text-[#146EF5] transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleInstantDemoLogin()}
            disabled={isDemoLoggingIn || isSendingOtp}
            className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Instant access with pre-configured student demo account"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span className="hidden sm:inline">Demo Login</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xs font-bold bg-[#146EF5] hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Login Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN LOGIN & HERO SECTION */}
      <main id="login-hero" className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* LEFT PANEL: Branding & Mission Overview */}
          <div className="lg:col-span-5 bg-[#061B3A] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xl text-white tracking-tight">CampusCare</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      AIML
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Student &amp; Staff Login</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  AI-Powered Campus Complaint Management
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Engineered as a high-impact college AIML project to streamline campus grievance redressal with automated priority triage, SLA transparency, and department accountability.
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
                    <span>1. Student Identity (Roll No, .edu.in Email, Phone)</span>
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
                    <span>3. Protected Grievance Dashboard</span>
                  </div>
                </div>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Google Gemini API Urgent Hazard &amp; Sentiment Triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>End-to-End Encrypted .edu.in Student Identity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>I.T.S Engineering College Department Routing</span>
                </div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-6 mt-6 border-t border-[#09254A] flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Protected Institutional Network
              </span>
              <span className="font-mono text-slate-400">I.T.S Engg College</span>
            </div>
          </div>

          {/* RIGHT PANEL: Interactive Authentication Forms */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
            <div>
              {/* Step indicator header */}
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-[11px] uppercase tracking-wider">
                  {step === "details"
                    ? "Step 1 of 2: Enter Student Credentials"
                    : step === "otp"
                    ? "Step 2 of 2: Enter OTP Code"
                    : "Authentication Complete"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">CampusCare Portal</span>
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
                      Enter your college roll number, official <code className="text-[#146EF5] font-semibold">.edu.in</code> email, and 10-digit phone number.
                    </p>
                  </div>

                  {/* Quick Demo Fill Pill Bar */}
                  <div className="bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E5EAF1] space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#146EF5]" />
                        <span>Registered Test Accounts</span>
                      </span>
                      <span className="text-[#146EF5] font-semibold">Click to auto-fill</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillPreset("23AIML001", "student@college.edu.in", "9876543210")}
                        className="px-2.5 py-1 bg-white border border-[#E5EAF1] hover:border-[#146EF5] hover:text-[#146EF5] rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
                      >
                        23AIML001 (student@college.edu.in)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillPreset("2022CSB1044", "rahul.sharma@campus.edu.in", "9876543210")}
                        className="px-2.5 py-1 bg-white border border-[#E5EAF1] hover:border-[#146EF5] hover:text-[#146EF5] rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
                      >
                        Rahul Sharma (2022CSB1044)
                      </button>
                      <button
                        type="button"
                        onClick={() => fillPreset("2023ECE052", "aman.verma@college.edu.in", "9123456780")}
                        className="px-2.5 py-1 bg-white border border-[#E5EAF1] hover:border-[#146EF5] hover:text-[#146EF5] rounded-lg text-[11px] font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
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
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5] focus:ring-1 focus:ring-blue-100 focus:outline-none transition"
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
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5] focus:ring-1 focus:ring-blue-100 focus:outline-none transition"
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
                        className="w-full pl-16 pr-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5] focus:ring-1 focus:ring-blue-100 focus:outline-none transition tracking-wider"
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
                        <span>Verify &amp; Enter CampusCare Dashboard</span>
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
                      Session verified. Redirecting to your CampusCare Dashboard...
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
              Campus complaints and student records are strictly secured under I.T.S Engineering College Privacy Rules and routed automatically to departmental ombudsmen.
            </div>
          </div>
        </div>
      </main>

      {/* 3. KEY PLATFORM FEATURES (4 Modern Cards) */}
      <section id="features-section" className="bg-white border-t border-[#E5EAF1] py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-xs uppercase tracking-wider border border-blue-200">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Next-Gen Campus Issue Redressal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Engineered with modern web architecture and Google Gemini API integration to replace manual grievance paperwork with automated tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-[#F7F9FC] border border-[#E5EAF1] hover:border-blue-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#146EF5] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Submit &amp; Track Complaints
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Students log in using verified college credentials to report infrastructure, academic, hostel, or IT issues with location tags and photo proof.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-[11px] font-bold text-[#146EF5]">
                <span>Real-time Status Tracking</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-[#F7F9FC] border border-[#E5EAF1] hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  AI-Assisted Complaint Management
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Embedded Google Gemini API analyzes grievance urgency, evaluates safety hazard scores, classifies departments, and assigns recommended SLA timelines.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-[11px] font-bold text-indigo-600">
                <span>Gemini API Intelligence</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-[#F7F9FC] border border-[#E5EAF1] hover:border-amber-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Transparent Status Tracking
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every step—from submission, AI triage, administrative assignment, to final resolution notes—is recorded in a timestamped verifiable audit timeline.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-[11px] font-bold text-amber-600">
                <span>Timestamped Audit Log</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-[#F7F9FC] border border-[#E5EAF1] hover:border-emerald-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Campus Administration Support
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provides designated portals for Wardens, Deans, HODs, and Super Admins to monitor resolution turnaround benchmarks and post direct officer remarks.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-[11px] font-bold text-emerald-600">
                <span>Multi-Department Portal</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT CAMPUSCARE SECTION */}
      <section id="about-section" className="bg-[#F7F9FC] border-t border-[#E5EAF1] py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-xs uppercase tracking-wider border border-blue-200">
                Project Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                About CampusCare &amp; AIML Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong>CampusCare</strong> is a student-led engineering project developed by the AIML team at <strong>I.T.S Engineering College</strong>. The platform was created to address the delays, lack of transparency, and manual bottlenecks in traditional university grievance redressal.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                By pairing a responsive React/TypeScript frontend with an automated Express backend and the <strong>Google Gemini API</strong>, CampusCare delivers instantaneous urgency classification, sentiment hazard analysis, and smart department assignment.
              </p>

              {/* AI Architecture Clarification Note */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#146EF5]" />
                  <span>AI Architecture Clarification</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  CampusCare utilizes the Google Gemini API (hosted multimodal intelligence) via secure server-side SDK calls to analyze ticket descriptions, detect safety emergencies, and calculate turnaround times dynamically.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#146EF5] flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">SLA Optimization</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tracks critical safety hazards with immediate 4-hour SLAs while standard inquiries are routed to 24-48 hour resolution targets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Multi-Factor Auth</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Prevents spam through university email OTP challenge-response authentication with CSV student verification.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Audit Analytics</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Visualizes recurring issues across hostel blocks and academic wings to empower proactive campus maintenance.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Two-Way Notes</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Students and department heads exchange real-time updates and clarification remarks directly on the ticket.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET THE TEAM SECTION (Exact Ordered List) */}
      <section id="team-section" className="bg-white border-t border-[#E5EAF1] py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-xs uppercase tracking-wider border border-blue-200">
              Student Project Team
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Meet the Student Developers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Designed and developed by the B.Tech Computer Science &amp; Engineering (AIML) project team at I.T.S Engineering College.
            </p>
          </div>

          {/* TEAM CARDS: Exact required order with Anuj Kushwaha prominent first */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member, idx) => (
              <div
                key={member.name}
                className={`p-6 sm:p-7 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                  member.isLead
                    ? "bg-gradient-to-b from-blue-50/60 to-white border-[#146EF5] shadow-xl ring-2 ring-[#146EF5]/20 md:-translate-y-1"
                    : "bg-white border-[#E5EAF1] shadow-xs hover:border-slate-300"
                }`}
              >
                <div className="space-y-4">
                  {/* Lead / Member Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        member.isLead
                          ? "bg-[#146EF5] text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {member.isLead ? "1st / Lead Developer" : `Student Developer #${idx + 1}`}
                    </span>
                    {member.isLead && (
                      <span className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>Project Lead</span>
                      </span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-md ${
                        member.isLead
                          ? "bg-gradient-to-tr from-[#146EF5] to-indigo-600 text-white"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                        {member.name}
                      </h3>
                      <p
                        className={`text-xs font-bold mt-0.5 ${
                          member.isLead ? "text-[#146EF5]" : "text-slate-600"
                        }`}
                      >
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.institution}</span>
                    </div>
                  </div>

                  {/* Core Contributions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Core Contributions
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {member.contributions.map((c) => (
                        <li key={c} className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              member.isLead ? "text-[#146EF5]" : "text-emerald-500"
                            }`}
                          />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PROJECT CREDITS MODULE */}
          <div className="pt-6 border-t border-[#E5EAF1] space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Project Technical Credits
              </h3>
              <p className="text-xs text-slate-500">
                Architectural breakdown of engineering layers across the full stack application.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROJECT_CREDITS.map((credit) => (
                <div
                  key={credit.area}
                  className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#146EF5]" />
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      {credit.area}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {credit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. GUIDANCE & INSTITUTION SECTION */}
      <section id="guidance-section" className="bg-[#F7F9FC] border-t border-[#E5EAF1] py-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-xs uppercase tracking-wider border border-blue-200">
              Guidance &amp; Institution
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {COLLEGE_INFORMATION.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Institutional Leadership &amp; Official Department Guidance Directory
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COLLEGE_DIRECTORY.map((dir) => (
              <div
                key={dir.name + dir.designation}
                className="p-5 rounded-2xl bg-white border border-[#E5EAF1] shadow-xs flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#146EF5] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{dir.name}</h4>
                  <p className="text-xs font-semibold text-[#146EF5] mt-0.5">{dir.designation}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{dir.department}</p>
                  {dir.email && (
                    <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">{dir.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Official Institution Link */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5EAF1] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-[#146EF5] shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Official Institution Web Directory</span>
                <span className="text-slate-500">Verified official records published by I.T.S Engineering College</span>
              </div>
            </div>
            <a
              href={COLLEGE_INFORMATION.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-[#146EF5] hover:bg-blue-100 font-bold transition"
            >
              <span>Visit itsengg.edu.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 7. CONTACT SECTION */}
      <section id="contact-section" className="bg-[#061B3A] text-white py-16 px-4 sm:px-8 lg:px-12 border-t border-[#0A2750]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Official Institution Contact
              </span>
              <h3 className="text-xl sm:text-3xl font-extrabold text-white mt-1">
                {COLLEGE_INFORMATION.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                University Grievance Redressal Committee (SGRC) Support Desk
              </p>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-4 py-2.5 bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Back to Login Form ↑</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#09254A] text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[10px] tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Campus Location</span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">
                {COLLEGE_INFORMATION.address}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[10px] tracking-wider">
                <Phone className="w-3.5 h-3.5" />
                <span>Helpline &amp; Admission Desk</span>
              </div>
              <p className="font-mono text-slate-200 text-sm font-bold">
                {COLLEGE_INFORMATION.phone}
              </p>
              <p className="text-slate-400 text-[11px]">Mon – Sat: 9:00 AM – 5:30 PM</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-[10px] tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                <span>Official Email Inquiries</span>
              </div>
              <p className="font-mono text-slate-200 text-sm">
                {COLLEGE_INFORMATION.email}
              </p>
              <p className="font-mono text-slate-400 text-xs">
                dir.engg@its.edu.in
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#040E1E] text-slate-400 py-10 px-4 sm:px-8 text-xs border-t border-[#09254A]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <ShieldCheck className="w-5 h-5 text-[#146EF5]" />
                <span className="font-extrabold text-white text-sm">CampusCare</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                  AI-Powered Grievance Redressal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                AI-Powered University Complaint Management System · {COLLEGE_INFORMATION.name}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
              <button onClick={() => scrollToSection("about-section")} className="hover:text-white transition cursor-pointer">
                About
              </button>
              <button onClick={() => scrollToSection("features-section")} className="hover:text-white transition cursor-pointer">
                Features
              </button>
              <button onClick={() => scrollToSection("team-section")} className="hover:text-white transition cursor-pointer">
                Team
              </button>
              <button onClick={() => scrollToSection("guidance-section")} className="hover:text-white transition cursor-pointer">
                Faculty
              </button>
              <button onClick={() => scrollToSection("contact-section")} className="hover:text-white transition cursor-pointer">
                Contact
              </button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-[#146EF5] transition cursor-pointer">
                Login
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#09254A] flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-[11px] text-slate-500">
            <div>
              Developed by: <strong className="text-slate-300">Anuj Kushwaha · Ankit Kumar Singh · Abhinav Tiwari</strong>
            </div>
            <div>
              &copy; {new Date().getFullYear()} CampusCare. All Rights Reserved · {COLLEGE_INFORMATION.name}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
