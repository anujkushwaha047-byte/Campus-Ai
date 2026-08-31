import React from "react";
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  PhoneCall,
  HelpCircle,
  Eye,
  Mail,
  Phone,
  GraduationCap
} from "lucide-react";
import { Complaint, StudentProfile } from "../types";
import { PriorityBadge, StatusBadge } from "../components/PriorityBadge";

interface StudentDashboardViewProps {
  studentProfile: StudentProfile | null;
  complaints: Complaint[];
  onOpenSubmitModal: () => void;
  onViewComplaint: (complaint: Complaint) => void;
  onNavigateToTab: (tab: string) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  studentProfile,
  complaints,
  onOpenSubmitModal,
  onViewComplaint,
  onNavigateToTab,
}) => {
  // Filter complaints filed by this student (by roll number, email, or student ID)
  const myComplaints = complaints.filter(
    (c) =>
      (studentProfile?.rollNumber && c.studentRoll.toUpperCase() === studentProfile.rollNumber.toUpperCase()) ||
      (studentProfile?.email && c.studentEmail.toLowerCase() === studentProfile.email.toLowerCase()) ||
      (studentProfile?.studentId && c.studentId === studentProfile.studentId) ||
      (studentProfile?.id && c.studentId === studentProfile.id)
  );

  const pendingCount = myComplaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = myComplaints.filter((c) => c.status === "In Progress" || c.status === "Under Review").length;
  const resolvedCount = myComplaints.filter((c) => c.status === "Resolved").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. WELCOME HERO BANNER (ROLL NO + EMAIL + PHONE HIGHLIGHTED) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#061B3A] via-[#09254A] to-[#146EF5] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Student Portal (.edu.in)</span>
              {studentProfile?.studentId && (
                <span className="font-mono text-white text-[11px] bg-blue-600/40 px-1.5 py-0.5 rounded">
                  {studentProfile.studentId}
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {studentProfile?.name || "Student"}!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Official CampusCare Student Dashboard. Track your complaints with AI triage, direct department dispatch, and SLA resolution timelines.
              </p>
            </div>

            {/* Profile Credentials Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs bg-[#061730]/80 border border-[#0F356B] p-3 rounded-2xl">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Roll: <strong className="font-mono text-blue-300">{studentProfile?.rollNumber || "23AIML001"}</strong></span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-mono">{studentProfile?.email || "student@college.edu.in"}</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono">+91 {studentProfile?.phone || "9876543210"}</span>
              </div>
            </div>
          </div>

          <button
            id="btn-student-submit-hero"
            onClick={onOpenSubmitModal}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-[#146EF5] hover:bg-blue-50 font-bold text-sm flex items-center justify-center gap-2.5 shrink-0 shadow-lg shadow-black/10 transition-all hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Submit New Complaint</span>
          </button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#146EF5] flex items-center justify-center font-bold shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Filed
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900">
              {myComplaints.length}
            </h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Redressal
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900">
              {pendingCount}
            </h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              In Progress / Review
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900">
              {inProgressCount}
            </h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Resolved Cases
            </p>
            <h4 className="text-2xl font-extrabold text-slate-900">
              {resolvedCount}
            </h4>
          </div>
        </div>
      </div>

      {/* 3. MY FILED COMPLAINTS LIST */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E5EAF1] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              My Active Grievances &amp; Live Tracking
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time status changes, departmental assignments, and official resolutions
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab("my_complaints")}
            className="text-xs font-bold text-[#146EF5] hover:underline cursor-pointer"
          >
            View Full List ({myComplaints.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {myComplaints.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No active complaints found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active complaints registered under roll number {studentProfile?.rollNumber}. Click below to file your first complaint.
              </p>
              <button
                onClick={onOpenSubmitModal}
                className="mt-4 px-4 py-2 bg-[#146EF5] text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint</span>
              </button>
            </div>
          ) : (
            myComplaints.map((c) => {
              const formattedDate = new Date(c.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={c.id}
                  onClick={() => onViewComplaint(c)}
                  className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        {c.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {c.category}
                      </span>
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {c.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {c.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                      {c.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {c.location}
                        </span>
                      )}
                      {c.assignedTo && (
                        <span className="text-slate-600">
                          Assigned: <strong>{c.assignedTo}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewComplaint(c);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#146EF5] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Track Progress</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. EMERGENCY & QUICK CONTACTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-[#E5EAF1] shadow-2xs">
          <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            Hostel Warden Helpline
          </h5>
          <p className="text-slate-500">24x7 Security &amp; Emergency Desk</p>
          <p className="font-bold text-[#146EF5] mt-2">+91 98765 43210 / Ext 402</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5EAF1] shadow-2xs">
          <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-blue-500" />
            IT &amp; Network Support
          </h5>
          <p className="text-slate-500">Wi-Fi, Portal &amp; Lab Assistance</p>
          <p className="font-bold text-[#146EF5] mt-2">itsupport@college.edu.in</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5EAF1] shadow-2xs">
          <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            Academic &amp; Exam Cell
          </h5>
          <p className="text-slate-500">Administrative Block, Room 102</p>
          <p className="font-bold text-[#146EF5] mt-2">examdesk@college.edu.in</p>
        </div>
      </div>
    </div>
  );
};
