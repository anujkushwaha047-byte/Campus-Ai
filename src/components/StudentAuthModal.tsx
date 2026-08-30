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
  X
} from "lucide-react";
import { StudentProfile } from "../types";
import { saveStoredAuth } from "../utils/auth";

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (student: StudentProfile) => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [rollNumber, setRollNumber] = useState("23AIML001");
  const [email, setEmail] = useState("student@college.edu.in");
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [demoCode, setDemoCode] = useState("");

  useEffect(() => {
    let timer: any;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, "");

    if (!cleanRoll) {
      setErrorMsg("Please enter your College Roll Number.");
      return;
    }

    if (!cleanEmail) {
      setErrorMsg("Please enter your official college email.");
      return;
    }

    const isValidDomain = cleanEmail.endsWith(".edu.in") || cleanEmail.endsWith("@campus.edu") || cleanEmail.endsWith("@college.edu.in");
    if (!isValidDomain) {
      setErrorMsg("Please use your official college email address ending with .edu.in (e.g. student@college.edu.in).");
      return;
    }

    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
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
        if (data.demoOtp) {
          setOtp(data.demoOtp.split(""));
        }
      } else {
        setErrorMsg(data.error || "Failed to send OTP. Please verify details.");
      }
    } catch (err) {
      setErrorMsg("Connection error while sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`modal-otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`modal-otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
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
        if (data.token) {
          saveStoredAuth(data.token, data.student);
        }
        onLoginSuccess(data.student);
        onClose();
      } else {
        setErrorMsg(data.error || "Invalid OTP code. Please retry.");
      }
    } catch (err) {
      setErrorMsg("Verification failed. Please check network.");
    } finally {
      setIsVerifying(false);
    }
  };

  const setDemoPreset = (roll: string, em: string, ph: string) => {
    setRollNumber(roll);
    setEmail(em);
    setPhone(ph);
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Branding Banner */}
        <div className="bg-[#061B3A] p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
          </div>

          <h3 className="font-bold text-lg text-white">CampusCare Student Login</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Roll Number + College Email (.edu.in) + Phone OTP
          </p>

          {/* Step Progress Pill */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#09254A] border border-[#0F356B] rounded-full text-[11px] font-bold text-blue-300">
            <span>{step === "credentials" ? "1. Student Details" : "2. Email Verification"}</span>
            <span>→</span>
            <span className="text-slate-400">3. Dashboard</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          {step === "credentials" ? (
            /* STEP 1: ROLL NUMBER + EMAIL + PHONE */
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Quick Presets */}
              <div className="bg-[#F7F9FC] p-2.5 rounded-xl border border-[#E5EAF1] space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Quick Demo Accounts (.edu.in)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDemoPreset("23AIML001", "student@college.edu.in", "9876543210")}
                    className="px-2 py-0.5 bg-white border border-[#E5EAF1] hover:border-[#146EF5] rounded text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    23AIML001
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoPreset("2022CSB1044", "rahul.sharma@campus.edu.in", "9876543210")}
                    className="px-2 py-0.5 bg-white border border-[#E5EAF1] hover:border-[#146EF5] rounded text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    Rahul Sharma
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoPreset("2023ECE052", "aman.verma@college.edu.in", "9123456780")}
                    className="px-2 py-0.5 bg-white border border-[#E5EAF1] hover:border-[#146EF5] rounded text-[11px] font-semibold text-slate-700 cursor-pointer"
                  >
                    Aman Verma
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  University Roll Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 23AIML001"
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    College Email ID <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#146EF5] font-semibold">Ends with .edu.in</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu.in"
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono focus:bg-white focus:border-[#146EF5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone Number (10 Digits) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 text-xs font-mono">
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
                    className="w-full pl-16 pr-3 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 font-mono tracking-wider focus:bg-white focus:border-[#146EF5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-3 bg-[#146EF5] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: ENTER OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <h4 className="font-bold text-slate-900 text-base">
                  Verify University Email
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  6-digit verification code sent to:
                </p>
                <div className="inline-block mt-1 font-mono font-bold text-xs text-[#146EF5] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {maskedEmail || email}
                </div>
              </div>

              {demoCode && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center justify-between">
                  <span>Demo OTP: <strong className="font-mono text-xs">{demoCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(demoCode.split(""))}
                    className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded text-[10px] cursor-pointer"
                  >
                    Auto Fill
                  </button>
                </div>
              )}

              {/* 6 Digit OTP Input Boxes */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`modal-otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-12 text-center font-mono font-bold text-lg text-slate-900 bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5] focus:outline-none transition shadow-2xs"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifying || otp.join("").length < 6}
                className="w-full py-3 bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying &amp; Logging In...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Enter Dashboard</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  ← Edit Details
                </button>

                {countdown > 0 ? (
                  <span className="text-slate-400 text-[11px]">
                    Resend in <strong className="text-slate-700">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-[#146EF5] font-bold text-[11px] hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
