import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Building,
  RotateCcw,
  Sparkles,
  Check,
  Calendar
} from "lucide-react";
import { Complaint, Category, Priority, ComplaintStatus } from "../types";
import { PriorityBadge, StatusBadge } from "../components/PriorityBadge";

interface ComplaintsListViewProps {
  complaints: Complaint[];
  onViewComplaint: (complaint: Complaint) => void;
  onResolveComplaint?: (complaint: Complaint) => void;
  title?: string;
  initialFilter?: { priority?: Priority; status?: ComplaintStatus; category?: Category };
  userRole?: string;
}

export const ComplaintsListView: React.FC<ComplaintsListViewProps> = ({
  complaints,
  onViewComplaint,
  onResolveComplaint,
  title = "All Complaints Directory",
  initialFilter,
  userRole = "admin",
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialFilter?.category || "all");
  const [priorityFilter, setPriorityFilter] = useState<string>(initialFilter?.priority || "all");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter?.status || "all");

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

  const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];
  const statuses: ComplaintStatus[] = ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"];

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.studentName.toLowerCase().includes(search.toLowerCase()) ||
        c.studentRoll.toLowerCase().includes(search.toLowerCase()) ||
        c.aiReason.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [complaints, search, categoryFilter, priorityFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = ["ID", "Student", "Roll", "Category", "Priority", "Status", "Title", "Date", "AI_Reason"];
    const rows = filteredComplaints.map((c) => [
      c.id,
      `"${c.studentName}"`,
      `"${c.studentRoll}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.title.replace(/"/g, '""')}"`,
      c.createdAt,
      `"${c.aiReason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campuscare_complaints_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredComplaints.length} of {complaints.length} total logged complaints
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 focus:bg-white focus:border-[#146EF5]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl font-medium text-slate-700 focus:bg-white focus:border-[#146EF5]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl font-medium text-slate-700 focus:bg-white focus:border-[#146EF5]"
            >
              <option value="all">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl font-medium text-slate-700 focus:bg-white focus:border-[#146EF5]"
            >
              <option value="all">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(categoryFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all" || search !== "") && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {categoryFilter !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Category: {categoryFilter}
              </span>
            )}
            {priorityFilter !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                Priority: {priorityFilter}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                Status: {statusFilter}
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[#146EF5] font-bold hover:underline ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Complaints Container */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        {/* Mobile View (< sm screens) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No complaints matched your filter criteria.
            </div>
          ) : (
            filteredComplaints.map((c) => {
              const formattedDate = new Date(c.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const isResolved = c.status === "Resolved";

              return (
                <div
                  key={c.id}
                  onClick={() => onViewComplaint(c)}
                  className="p-4 hover:bg-blue-50/40 active:bg-blue-50/70 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                        {c.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {c.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {formattedDate}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      <span className="font-semibold text-slate-600">AI: </span>
                      {c.aiReason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-[#146EF5] font-bold text-[11px] flex items-center justify-center shrink-0">
                        {c.studentName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {c.studentName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">
                          {c.studentRoll}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <PriorityBadge priority={c.priority} size="sm" />
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onViewComplaint(c)}
                      className="px-3 py-1 text-xs font-bold text-[#146EF5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    {userRole === "admin" && onResolveComplaint && !isResolved && (
                      <button
                        onClick={() => onResolveComplaint(c)}
                        className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop / Tablet Table (sm+ screens) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Complaint ID</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No complaints matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const formattedDate = new Date(c.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const isResolved = c.status === "Resolved";

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onViewComplaint(c)}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    >
                      {/* Complaint ID */}
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap font-mono">
                        {c.id}
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate" title={c.title}>
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate" title={c.aiReason}>
                          <span className="font-semibold text-slate-500">AI:</span> {c.aiReason}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          {c.category}
                        </span>
                      </td>

                      {/* Student */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                            {c.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {c.studentName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {c.studentRoll}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-xs">
                        {formattedDate}
                      </td>

                      {/* Actions: View & Resolve */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            id={`btn-view-${c.id}`}
                            onClick={() => onViewComplaint(c)}
                            className="px-3 py-1 text-xs font-bold text-[#146EF5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {userRole === "admin" && onResolveComplaint && (
                            !isResolved ? (
                              <button
                                id={`btn-resolve-${c.id}`}
                                onClick={() => onResolveComplaint(c)}
                                className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Mark complaint as resolved"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Resolve</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Resolved</span>
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
