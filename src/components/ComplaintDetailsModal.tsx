import React, { useState } from "react";
import {
  X,
  User,
  MapPin,
  Calendar,
  Building,
  Shield,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { Complaint, Priority, ComplaintStatus } from "../types";
import { PriorityBadge, StatusBadge } from "./PriorityBadge";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { ComplaintTimeline } from "./ComplaintTimeline";
import { apiRequest } from "../api";

interface ComplaintDetailsModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: "admin" | "student";
  onUpdateComplaint: (updated: Partial<Complaint> & { newComment?: string; author?: string; role?: 'admin' | 'student' | 'officer'; overrideNote?: string }) => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  isOpen,
  onClose,
  userRole,
  onUpdateComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "comments" | "admin_actions">("overview");
  const [commentText, setCommentText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint?.status || "Pending");
  const [selectedPriority, setSelectedPriority] = useState<Priority>(complaint?.priority || "Medium");
  const [assignedOfficer, setAssignedOfficer] = useState(complaint?.assignedTo || "");
  const [overrideNote, setOverrideNote] = useState("");
  const [isSuggestingAi, setIsSuggestingAi] = useState(false);
  const [aiDraft, setAiDraft] = useState<{ resolutionSummary: string; internalNotes: string; preventativeAction: string } | null>(null);

  if (!isOpen || !complaint) return null;

  const handleStatusChange = (newStatus: ComplaintStatus) => {
    onUpdateComplaint({
      status: newStatus,
      author: userRole === "admin" ? "Super Administrator" : complaint.studentName,
      overrideNote: overrideNote || `Status updated to ${newStatus}.`,
    });
  };

  const handlePriorityOverride = () => {
    onUpdateComplaint({
      priority: selectedPriority,
      isOverriddenByAdmin: true,
      overrideNote: overrideNote || `Priority adjusted to ${selectedPriority} by administrator.`,
      author: "Super Administrator",
    });
  };

  const handleAssignOfficer = () => {
    if (!assignedOfficer) return;
    onUpdateComplaint({
      assignedTo: assignedOfficer,
      assignedOfficerRole: "Department Duty Officer",
      author: "Super Administrator",
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onUpdateComplaint({
      newComment: commentText.trim(),
      author: userRole === "admin" ? "Super Administrator" : complaint.studentName,
      role: userRole === "admin" ? "admin" : "student",
    });
    setCommentText("");
  };

  const handleRequestAiResolution = async () => {
    setIsSuggestingAi(true);
    try {
      const data = await apiRequest<{ resolutionSummary: string; internalNotes: string; preventativeAction: string }>("/api/ai/suggest-resolution", {
        method: "POST",
        body: JSON.stringify({ complaintId: complaint.id }),
      });
      setAiDraft(data);
    } catch (err) {
      console.error("Failed to generate AI resolution:", err);
    } finally {
      setIsSuggestingAi(false);
    }
  };

  const formattedDate = new Date(complaint.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5EAF1] shadow-2xl w-full max-w-4xl max-h-[94vh] sm:max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5EAF1] bg-slate-50/80 flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap mb-1.5">
              <span className="font-extrabold text-xs sm:text-base text-slate-900 bg-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-slate-200 shadow-2xs">
                {complaint.id}
              </span>
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-blue-50 text-[#146EF5] font-bold text-[11px] sm:text-xs border border-blue-200">
                {complaint.category}
              </span>
              <PriorityBadge priority={complaint.priority} size="sm" showIcon />
              <StatusBadge status={complaint.status} size="sm" />

              {complaint.isOverriddenByAdmin && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Override Active
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight line-clamp-2">
              {complaint.title}
            </h2>
          </div>

          <button
            id="btn-close-complaint-modal"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5EAF1] px-4 sm:px-6 bg-white overflow-x-auto">
          {[
            { id: "overview", label: "Overview & AI" },
            { id: "timeline", label: "Timeline" },
            { id: "comments", label: `Notes (${complaint.comments.length})` },
            ...(userRole === "admin" ? [{ id: "admin_actions", label: "Admin Redressal" }] : []),
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 sm:py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#146EF5] text-[#146EF5]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 bg-[#F7F9FC]/60">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Student Details Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Student Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-slate-400">Student Name</p>
                      <p className="font-bold text-slate-900">{complaint.studentName}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400">Roll Number</p>
                    <p className="font-bold text-slate-900">{complaint.studentRoll}</p>
                  </div>

                  <div>
                    <p className="text-slate-400">Department & Year</p>
                    <p className="font-bold text-slate-900 truncate">
                      {complaint.studentDepartment} ({complaint.studentYear})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-slate-400">Submitted On</p>
                      <p className="font-bold text-slate-900">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint Description & Location */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs space-y-4">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                    Issue Description
                  </h4>
                  <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    {complaint.description}
                  </p>
                </div>

                {complaint.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <MapPin className="w-4 h-4 text-[#146EF5] shrink-0" />
                    <span>
                      <strong className="text-slate-900">Reported Location:</strong> {complaint.location}
                    </span>
                  </div>
                )}

                {/* Assigned Department & Officer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Department</span>
                    <span className="font-bold text-slate-900">
                      {complaint.department || "Central Support Desk"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Officer</span>
                    <span className="font-bold text-slate-900">
                      {complaint.assignedTo || "Unassigned"} {complaint.assignedOfficerRole ? `(${complaint.assignedOfficerRole})` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Card */}
              <AIAnalysisCard
                category={complaint.category}
                priority={complaint.priority}
                reason={complaint.aiReason}
                confidence={complaint.aiConfidence}
                recommendedDepartment={complaint.department}
              />
            </div>
          )}

          {/* 2. TIMELINE TAB */}
          {activeTab === "timeline" && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-6">
                Redressal Activity Progression
              </h3>
              <ComplaintTimeline
                timeline={complaint.timeline}
                currentStatus={complaint.status}
              />
            </div>
          )}

          {/* 3. COMMENTS & NOTES TAB */}
          {activeTab === "comments" && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900">
                Official Correspondence & Progress Notes
              </h3>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {complaint.comments.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-8">
                    No notes or comments have been posted yet.
                  </p>
                ) : (
                  complaint.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        comm.role === "admin" || comm.role === "officer"
                          ? "bg-blue-50/50 border-blue-100"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {comm.author}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold ${
                              comm.role === "admin"
                                ? "bg-blue-200 text-blue-800"
                                : comm.role === "officer"
                                ? "bg-purple-200 text-purple-800"
                                : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            {comm.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700">{comm.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write an official note or reply..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5]"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2.5 bg-[#146EF5] text-white font-bold text-xs rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          )}

          {/* 4. ADMIN ACTIONS TAB (Admin Only) */}
          {activeTab === "admin_actions" && userRole === "admin" && (
            <div className="space-y-6">
              {/* AI Resolution Draft Generator */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">AI Resolution Drafting Assistant</h4>
                      <p className="text-xs text-blue-200">
                        Generate official redressal summary and preventative steps with Gemini
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRequestAiResolution}
                    disabled={isSuggestingAi}
                    className="px-4 py-2 bg-[#146EF5] hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isSuggestingAi ? "Generating Draft..." : "Generate AI Draft"}</span>
                  </button>
                </div>

                {aiDraft && (
                  <div className="bg-slate-900/80 rounded-xl p-4 border border-blue-400/30 text-xs space-y-3 mt-4">
                    <div>
                      <p className="font-bold text-blue-300 mb-1">Proposed Resolution Notice:</p>
                      <p className="text-slate-200">{aiDraft.resolutionSummary}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-700">
                      <p className="font-bold text-amber-300 mb-1">Internal Action:</p>
                      <p className="text-slate-300">{aiDraft.internalNotes}</p>
                    </div>
                    <button
                      onClick={() => {
                        onUpdateComplaint({
                          status: "Resolved",
                          newComment: `Resolution: ${aiDraft.resolutionSummary}`,
                          author: "Super Administrator",
                          overrideNote: aiDraft.resolutionSummary,
                        });
                      }}
                      className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Apply & Resolve Complaint</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Status Update & Priority Override Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Changer */}
                <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-3">
                    Update Complaint Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {(["Pending", "Under Review", "In Progress", "Resolved", "Rejected"] as ComplaintStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`p-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer text-left ${
                          complaint.status === st
                            ? "bg-blue-50 border-[#146EF5] text-[#146EF5] ring-2 ring-blue-100"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Override */}
                <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Override AI Priority
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Manually adjust triage rating with audit logging
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(["Critical", "High", "Medium", "Low"] as Priority[]).map((pr) => (
                      <button
                        key={pr}
                        onClick={() => setSelectedPriority(pr)}
                        className={`p-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selectedPriority === pr
                            ? "border-[#146EF5] bg-blue-50 text-[#146EF5]"
                            : "border-slate-200 text-slate-700"
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Reason for overriding AI rating..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mb-3"
                  />

                  <button
                    onClick={handlePriorityOverride}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Save Priority Override
                  </button>
                </div>
              </div>

              {/* Officer & Department Re-routing */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs">
                <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-3">
                  Assign Officer / Maintenance Desk
                </h4>
                <div className="flex gap-3 flex-col sm:flex-row">
                  <select
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Select Duty Officer...</option>
                    <option value="Chief Warden Dr. Ramesh V.">Chief Warden Dr. Ramesh V. (Hostel)</option>
                    <option value="Head Librarian Mrs. Sunita Rao">Mrs. Sunita Rao (Library)</option>
                    <option value="Dr. Arvind Swamy (Exam Controller)">Dr. Arvind Swamy (Exam Cell)</option>
                    <option value="Er. Sandeep Joshi (IT Admin)">Er. Sandeep Joshi (IT Infra)</option>
                    <option value="Chief Engineer K. N. Sastry">K. N. Sastry (Estate & Civil)</option>
                    <option value="Mr. Baldev Singh (Transport)">Mr. Baldev Singh (Transport)</option>
                  </select>

                  <button
                    onClick={handleAssignOfficer}
                    disabled={!assignedOfficer}
                    className="px-5 py-2 bg-[#146EF5] text-white font-bold text-xs rounded-xl hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                  >
                    Assign Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5EAF1] bg-white flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Complaint Tracking ID: <strong className="text-slate-800">{complaint.id}</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
