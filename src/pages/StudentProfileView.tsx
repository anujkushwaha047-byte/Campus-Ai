import React from "react";
import { User, Mail, GraduationCap, Building2, Phone, Bell, Shield, Key } from "lucide-react";
import { StudentProfile, Complaint } from "../types";

interface StudentProfileViewProps {
  studentProfile: StudentProfile | null;
  complaints: Complaint[];
  onLogout: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  studentProfile,
  complaints,
  onLogout,
}) => {
  const myComplaints = complaints.filter(
    (c) =>
      c.studentRoll === studentProfile?.rollNumber ||
      c.studentEmail === studentProfile?.email
  );

  const resolved = myComplaints.filter((c) => c.status === "Resolved").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EAF1] shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#146EF5] to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {studentProfile?.name?.charAt(0) || "S"}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {studentProfile?.name || "Rahul Sharma"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#146EF5] border border-blue-200">
                Verified Student
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Roll No: <span className="font-bold text-slate-800">{studentProfile?.rollNumber || "2022CSB1044"}</span> • {studentProfile?.department || "Computer Science"} ({studentProfile?.year || "3rd Year"})
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-xs">
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-400">Total Grievances: </span>
                <strong className="text-slate-900">{myComplaints.length}</strong>
              </div>
              <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <span className="text-emerald-700">Resolved: </span>
                <strong className="text-emerald-900">{resolved}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3 p-3 bg-[#F7F9FC] rounded-xl">
            <Mail className="w-4 h-4 text-[#146EF5]" />
            <div>
              <span className="text-slate-400 block">Registered Email</span>
              <span className="font-bold text-slate-900">{studentProfile?.email || "rahul.sharma@campus.edu"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F7F9FC] rounded-xl">
            <Building2 className="w-4 h-4 text-[#146EF5]" />
            <div>
              <span className="text-slate-400 block">Hostel & Room</span>
              <span className="font-bold text-slate-900">Hostel Block B, Room 204</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F7F9FC] rounded-xl">
            <Phone className="w-4 h-4 text-[#146EF5]" />
            <div>
              <span className="text-slate-400 block">Mobile Contact</span>
              <span className="font-bold text-slate-900">+91 98765 12345</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F7F9FC] rounded-xl">
            <Shield className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-slate-400 block">Verification Status</span>
              <span className="font-bold text-emerald-600">Active (SSO Verified)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
