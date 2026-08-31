import React, { useState, useEffect } from "react";
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
  ChevronRight,
  GraduationCap,
  Bot,
  Clock,
  ArrowLeft
} from "lucide-react";
import { StudentProfile } from "../types";

interface StudentLoginPageProps {
  onLoginSuccess: (student: StudentProfile) => void;
  onCancel?: () => void;
  initialRollNumber?: string;
  initialEmail?: string;
  initialPhone?: string;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  initialRollNumber = "23AIML001",
  initialEmail = "student@college.edu.in",
  initialPhone = "9876543210"
}) => {
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [rollNumber, setRollNumber] = useState(initialRollNumber);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  // Step 1: Submit Details & Request OTP
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
    const isValidDomain = cleanEmail.endsWith(".edu.in") || cleanEmail.endsWith("@campus.edu") || cleanEmail.endsWith("@college.edu.in");
    if (!isValidDomain) {
      setErrorMsg("Please use your official college email address ending with .edu.in (e.g. student@college.edu.in). Personal emails (@gmail.com) are not allowed.");
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
          phone: cleanPhone
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

  // Step 2: Verify OTP
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
        setTimeout(() => {
          onLoginSuccess(data.student);
        }, 1200);
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

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* LEFT COLUMN: Deep Navy Brand Panel (Hidden or top banner on very small mobile, full width on desktop) */}
        <div className="lg:col-span-5 bg-[#061B3A] text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow Accent */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Brand & Mission Header */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl text-white tracking-tight">CampusCare</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    AI
                  </span>
                </div>
                <span className="text-xs text-slate-400">Official Grievance Redressal</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                Student Identity &amp; Redressal Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Log in using your verified college credentials to report campus issues, track SLA resolution in real time, and communicate directly with university administration.
              </p>
            </div>

            {/* 3-Step Flow Indicator */}
            <div className="bg-[#09254A]/80 border border-[#0F356B] rounded-2xl p-4 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Authentication Process
              </div>
              <div className="space-y-2.5 text-xs">
                <div className={`flex items-center gap-2.5 ${step === "details" ? "text-white font-bold" : "text-slate-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "details" ? "bg-[#146EF5] text-white" : "bg-emerald-500 text-white"
                  }`}>
                    {step !== "details" ? "✓" : "1"}
                  </div>
                  <span>1. Student Details (Roll No, .edu.in Email, Phone)</span>
                </div>

                <div className={`flex items-center gap-2.5 ${step === "otp" ? "text-white font-bold" : "text-slate-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "otp" ? "bg-[#146EF5] text-white" : step === "success" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                  }`}>
                    {step === "success" ? "✓" : "2"}
                  </div>
                  <span>2. OTP Email Verification (5 min validity)</span>
                </div>

                <div className={`flex items-center gap-2.5 ${step === "success" ? "text-white font-bold" : "text-slate-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "success" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
                  }`}>
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
                <span>AI Automated Urgency &amp; Priority Triage</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Encrypted CSV Registry &amp; Anti-Spam Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Live Status Timelines &amp; Direct Admin Redressal</span>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="pt-6 mt-6 border-t border-[#09254A] flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Official University Subdomain
            </span>
            <span className="font-mono text-slate-500">v2.4 CSV-Storage</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Login & OTP Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Top Navigation bar in right column */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#146EF5] font-bold text-[11px] uppercase tracking-wider">
                  {step === "details" ? "Step 1 of 2: Details" : step === "otp" ? "Step 2 of 2: OTP" : "Authenticated"}
                </span>
              </div>

              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Main View</span>
                </button>
              )}
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
                    Student Login &amp; Verification
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your college roll number, official <code className="text-[#146EF5] font-semibold">.edu.in</code> email, and 10-digit phone number.
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
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    10-digit mobile number registered with college records.
                  </span>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3.5 bg-[#146EF5] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating &amp; Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Validate &amp; Send OTP</span>
                        <ArrowRight className="w-4 h-4" />
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
                      <span>Demo Verification Code: <strong className="font-mono text-amber-900 text-sm font-bold ml-1">{demoCode}</strong></span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp(demoCode.split(""))}
                      className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded text-[10px] cursor-pointer"
                    >
                      Fill Code
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
                      <span>Verifying &amp; Registering Student...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify &amp; Continue to Dashboard</span>
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
                    Verification Complete!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Welcome, <strong>{verifiedStudent?.name || "Student"}</strong> ({verifiedStudent?.rollNumber}).
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    Saved to university students registry (students.csv)
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-[#146EF5] font-semibold pt-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading your Student Dashboard...</span>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="pt-6 border-t border-[#E5EAF1] text-center text-[11px] text-slate-400">
            Complaints submitted are processed under University Privacy Rules and routed automatically to departmental ombudsmen.
          </div>
        </div>
      </div>
    </div>
  );
};
