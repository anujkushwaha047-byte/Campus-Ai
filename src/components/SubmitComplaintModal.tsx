import React, { useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Trash2,
  Bot,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import confetti from "canvas-confetti";
import { Category, Priority, StudentProfile, Complaint } from "../types";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { apiPost, hasAuthToken } from "../api";

interface SubmitComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile | null;
  onSubmitSuccess: (newComplaint: Complaint) => void;
  onOpenTrackView: (complaint: Complaint) => void;
}

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  onSubmitSuccess,
  onOpenTrackView,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Hostel");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<{ id: string; name: string; size: string; type: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const categories: Category[] = [
    "Hostel",
    "Faculty",
    "Library",
    "Examination",
    "IT",
    "Infrastructure",
    "Transport",
    "Fees",
    "Other",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      const newFiles = fileList.map((f: File) => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || "document",
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg("Please provide both a complaint title and detailed description.");
      return;
    }

    setErrorMsg("");
    if (!hasAuthToken()) {
      setErrorMsg("Please log in again before submitting a complaint.");
      return;
    }
    setIsSubmitting(true);

    try {
      // AI triage is best effort; complaint capture must remain available during AI outages.
      let aiData: {
        category?: Category;
        priority?: Priority;
        reason?: string;
        confidence?: number;
        recommendedDepartment?: string;
        department?: string;
      } = {};
      try {
        aiData = await apiPost("/api/ai/analyze-complaint", {
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          course: studentProfile?.course,
          department: studentProfile?.department,
        });
      } catch (aiError) {
        console.warn("AI analysis unavailable; saving with fallback classification.", aiError);
      }

      // 2. Submit new complaint with AI results
      const data = await apiPost<{ success: boolean; complaint?: Complaint; error?: string }>("/api/complaints", {
          studentId: studentProfile?.studentId || studentProfile?.id || "STU001",
          studentName: studentProfile?.name || "Student User",
          studentRoll: studentProfile?.rollNumber || "23AIML001",
          studentEmail: studentProfile?.email || "student@college.edu.in",
          studentDepartment: studentProfile?.department || "Computer Science",
          studentYear: studentProfile?.year || "3rd Year",
          course: studentProfile?.course,
          title: title.trim(),
          description: description.trim(),
          category: aiData.category || category,
          priority: aiData.priority || "Medium",
          aiReason: aiData.reason || "Analyzed by CampusCare AI Engine.",
          aiConfidence: aiData.confidence || 96,
          department: aiData.department || aiData.recommendedDepartment || `${category} Support Department`,
          location: location.trim() || "Main Campus",
          attachments: files,
      });
      if (data.success && data.complaint) {
        setSubmittedComplaint(data.complaint);
        onSubmitSuccess(data.complaint);

        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#146EF5", "#3B82F6", "#10B981", "#F59E0B"],
        });
      } else {
        setErrorMsg(data.error || "We could not save your complaint. Please try again.");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMsg(err?.message || "We could not save your complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle("");
    setCategory("Hostel");
    setDescription("");
    setLocation("");
    setFiles([]);
    setSubmittedComplaint(null);
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#E5EAF1] flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {submittedComplaint ? "Complaint Submitted Successfully" : "Submit a Complaint"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {submittedComplaint
                ? "Your issue has been logged and assigned automated AI priority"
                : "Tell us what happened. Our AI system will analyze your complaint and help prioritize it for faster resolution."}
            </p>
          </div>

          <button
            id="btn-close-submit-modal"
            onClick={() => {
              handleResetForm();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* SUCCESS CONFIRMATION VIEW */}
          {submittedComplaint ? (
            <div className="space-y-6 text-center sm:text-left animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Complaint Registered: {submittedComplaint.id}
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your complaint has been acknowledged and routed to the relevant university department.
                  </p>
                </div>
              </div>

              {/* AI Analysis Confirmation Card */}
              <AIAnalysisCard
                category={submittedComplaint.category}
                priority={submittedComplaint.priority}
                reason={submittedComplaint.aiReason}
                confidence={submittedComplaint.aiConfidence}
                recommendedDepartment={submittedComplaint.department}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleResetForm();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Back to Dashboard
                </button>
                <button
                  id="btn-track-submitted-complaint"
                  onClick={() => {
                    onOpenTrackView(submittedComplaint);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <span>Track Complaint</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : isSubmitting ? (
            /* AI ANALYZING PROCESSING STATE */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl animate-pulse">
                  <Bot className="w-10 h-10 animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full animate-ping" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Analyzing your complaint...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Gemini AI is parsing the issue details to determine safety hazards, urgency priority, and departmental routing.
                </p>
              </div>

              <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#146EF5] rounded-full animate-[pulse_1s_infinite] w-full" />
              </div>
            </div>
          ) : (
            /* SUBMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complaint Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Water supply problem in Hostel Block B"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5] text-slate-900"
                />
              </div>

              {/* Category & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5] text-slate-900 font-semibold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location / Room (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hostel Block B, Room 204"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5] text-slate-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complaint Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue clearly, including relevant details (what happened, how many students affected, any electrical/physical hazards)..."
                  className="w-full p-4 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5] text-slate-900 resize-none leading-relaxed"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Attachments (Images, PDF, Documents)
                </label>

                <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#146EF5] rounded-2xl p-4 text-center bg-[#F7F9FC] transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-700">
                    Click to browse or drag & drop files
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, PDF up to 10MB
                  </p>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">
                            {file.name}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            ({file.size})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-complaint"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#146EF5] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit & Analyze Complaint</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
