import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Filter
} from "lucide-react";
import { Complaint } from "../types";
import { getAuthHeaders } from "../utils/auth";

export interface AdminStudentItem {
  id: string;
  student_id: string;
  roll_number: string;
  email: string;
  phone: string;
  email_verified: boolean;
  registration_date: string;
  name: string;
  department: string;
  year: string;
  complaintCount: number;
  complaints?: {
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
  }[];
}

interface StudentsManagementViewProps {
  onViewComplaint?: (complaint: Complaint) => void;
  allComplaints: Complaint[];
}

export const StudentsManagementView: React.FC<StudentsManagementViewProps> = ({
  onViewComplaint,
  allComplaints,
}) => {
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStudents = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/admin/students", {
        headers: getAuthHeaders("admin"),
      });
      const data = await res.json();
      if (data && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Failed to fetch students from CSV backend:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.roll_number.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.student_id.toLowerCase().includes(q) ||
      s.phone.includes(q);

    const matchesVerified =
      filterVerified === "all" ||
      (filterVerified === "verified" && s.email_verified) ||
      (filterVerified === "unverified" && !s.email_verified);

    return matchesSearch && matchesVerified;
  });

  const totalRegistered = students.length;
  const totalVerified = students.filter((s) => s.email_verified).length;
  const totalComplaintsFiled = students.reduce((acc, s) => acc + (s.complaintCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5EAF1] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#146EF5] text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              CSV Database (students.csv)
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Real-time Storage Synced
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Registered Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, audit, and inspect student records registered via the college OTP verification system.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudents}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#146EF5]" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Refresh CSV"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#146EF5] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalRegistered}</div>
            <div className="text-xs text-slate-500 font-medium">Total Registered Students</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalVerified}</div>
            <div className="text-xs text-slate-500 font-medium">Email Verified (.edu.in)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF1] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalComplaintsFiled}</div>
            <div className="text-xs text-slate-500 font-medium">Associated Grievances Logged</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF1] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Roll Number, Email, Name, or Phone..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 focus:bg-white focus:border-[#146EF5]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Filter:</span>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterVerified("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterVerified === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilterVerified("verified")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterVerified === "verified"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Verified ({students.filter((s) => s.email_verified).length})
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#146EF5]" />
            <p className="text-xs font-medium">Reading students from students.csv...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No student records found</p>
            <p className="text-xs text-slate-500">
              {searchQuery ? "Try refining your search filter." : "Students will appear here upon OTP registration."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F9FC] border-b border-[#E5EAF1] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Student ID</th>
                    <th className="py-3.5 px-5">Student Info & Roll No</th>
                    <th className="py-3.5 px-5">College Email (.edu.in)</th>
                    <th className="py-3.5 px-5">Phone</th>
                    <th className="py-3.5 px-5">Verification</th>
                    <th className="py-3.5 px-5">Registered Date</th>
                    <th className="py-3.5 px-5 text-center">Complaints</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF1] text-xs">
                  {filteredStudents.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#146EF5]">
                        {s.student_id}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 font-semibold mt-0.5">
                          {s.roll_number}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {s.department} • {s.year}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium font-mono text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{s.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>+91 {s.phone || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        {s.email_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                        {s.registration_date}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          s.complaintCount > 0
                            ? "bg-blue-50 text-[#146EF5] border border-blue-200"
                            : "bg-slate-100 text-slate-400"
                        }`}>
                          {s.complaintCount} Filed
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5EAF1] hover:border-[#146EF5] hover:text-[#146EF5] text-slate-700 font-bold text-[11px] rounded-lg transition shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[#E5EAF1]">
              {filteredStudents.map((s) => (
                <div key={s.student_id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold text-[#146EF5]">
                        {s.student_id}
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{s.name}</div>
                      <div className="text-xs font-mono font-semibold text-slate-500">
                        Roll: {s.roll_number}
                      </div>
                    </div>
                    {s.email_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>+91 {s.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Registered: {s.registration_date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Complaints: <strong className="text-slate-900">{s.complaintCount}</strong>
                    </span>
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1.5 bg-[#146EF5] text-white font-bold text-xs rounded-lg flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Student Details & Grievances Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#061B3A] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center text-white font-bold text-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{selectedStudent.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">
                      {selectedStudent.student_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Roll: {selectedStudent.roll_number} • {selectedStudent.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F7F9FC] p-4 rounded-2xl border border-[#E5EAF1] text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Official College Email</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Mobile Number</span>
                  <span className="font-semibold text-slate-800 font-mono">+91 {selectedStudent.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Email Verification Status</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified via OTP (Active in students.csv)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Registration Date</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.registration_date}</span>
                </div>
              </div>

              {/* Associated Grievances */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
                  <span>Grievances Filed by Student ({selectedStudent.complaintCount})</span>
                </h4>

                {selectedStudent.complaints && selectedStudent.complaints.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedStudent.complaints.map((c) => {
                      const fullComplaint = allComplaints.find((comp) => comp.id === c.id);
                      return (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-xl border border-[#E5EAF1] hover:border-[#146EF5] transition bg-white flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold font-mono text-[#146EF5]">{c.id}</span>
                              <span className="text-xs font-bold text-slate-900">{c.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                              <span>Category: <strong>{c.category}</strong></span>
                              <span>•</span>
                              <span>Priority: <strong>{c.priority}</strong></span>
                              <span>•</span>
                              <span>Status: <strong>{c.status}</strong></span>
                            </div>
                          </div>

                          {fullComplaint && onViewComplaint && (
                            <button
                              onClick={() => {
                                setSelectedStudent(null);
                                onViewComplaint(fullComplaint);
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-[#146EF5] hover:bg-[#146EF5] hover:text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                            >
                              Inspect
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    This student has not submitted any complaints yet.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-[#E5EAF1] flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
