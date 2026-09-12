import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Eye, LogOut, MapPin, ShieldAlert, Wrench, LucideIcon } from "lucide-react";
import { Complaint, ComplaintStatus, StudentProfile } from "../types";
import { getAuthHeaders, clearStoredAuth } from "../utils/auth";
import { PriorityBadge, StatusBadge } from "../components/PriorityBadge";

interface DepartmentDashboardProps {
  profile: StudentProfile;
  onLogout: () => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({ profile, onLogout }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch("/api/complaints/assigned", { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to load assigned complaints.");
    setComplaints(data.complaints || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const updateStatus = async (complaint: Complaint, status: ComplaintStatus) => {
    setError("");
    const res = await fetch(`/api/complaints/${complaint.id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Unable to update complaint.");
      return;
    }
    setComplaints((items) => items.map((item) => item.id === data.complaint.id ? data.complaint : item));
    setSelected(data.complaint);
  };

  const counts = useMemo(() => ({
    assigned: complaints.filter((c) => c.status === "Assigned").length,
    progress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    urgent: complaints.filter((c) => c.priority === "Urgent" || c.priority === "Critical").length,
  }), [complaints]);

  const logout = () => {
    clearStoredAuth();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-4 sm:p-8 text-slate-900">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">{profile.role === "warden" ? "Warden Dashboard" : "Department Dashboard"}</p>
          <h1 className="text-2xl font-extrabold mt-1">Welcome, {profile.name}</h1>
          <p className="text-sm text-slate-500">{profile.assignedDepartment || profile.department || "Assigned complaints"}</p>
        </div>
        <button onClick={logout} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>
      <main className="max-w-6xl mx-auto space-y-6">
        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            ["Assigned", counts.assigned, Clock],
            ["In Progress", counts.progress, Wrench],
            ["Resolved", counts.resolved, CheckCircle2],
            ["Urgent", counts.urgent, ShieldAlert],
          ] as [string, number, LucideIcon][]).map(([label, value, Icon]) => (
            <div key={String(label)} className="bg-white rounded-2xl border border-slate-200 p-5">
              <Icon className="w-5 h-5 text-blue-600 mb-3" />
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-extrabold">{value as number}</p>
            </div>
          ))}
        </div>
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100"><h2 className="font-bold">Assigned Complaints</h2></div>
          <div className="divide-y divide-slate-100">
            {complaints.length === 0 ? <p className="p-8 text-sm text-slate-500 text-center">No complaints are currently assigned to you.</p> : complaints.map((complaint) => (
              <div key={complaint.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><PriorityBadge priority={complaint.priority} /><StatusBadge status={complaint.status} /></div>
                  <h3 className="font-bold mt-2">{complaint.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{complaint.location || "Location not specified"}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setSelected(complaint)} className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold flex items-center gap-1"><Eye className="w-4 h-4" /> View</button>
                  {complaint.status === "Assigned" && <button onClick={() => updateStatus(complaint, "In Progress")} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Start Work</button>}
                  {complaint.status === "In Progress" && <button onClick={() => updateStatus(complaint, "Resolved")} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Resolve</button>}
                </div>
              </div>
            ))}
          </div>
        </section>
        {selected && <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between"><h2 className="font-bold">{selected.title}</h2><StatusBadge status={selected.status} /></div>
            <p className="text-sm text-slate-600">{selected.description}</p>
            <p className="text-xs text-slate-500">Category: {selected.category} · Location: {selected.location || "Not specified"}</p>
            <button onClick={() => setSelected(null)} className="w-full py-2 rounded-xl bg-slate-100 text-xs font-bold">Close</button>
          </div>
        </div>}
      </main>
    </div>
  );
};
