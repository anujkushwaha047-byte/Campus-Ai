import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Complaint, Category, Priority, ComplaintStatus } from "../types";
import { PriorityBadge, StatusBadge } from "../components/PriorityBadge";
import { apiGet } from "../api";

interface ComplaintsListViewProps {
  complaints: Complaint[];
  onViewComplaint: (complaint: Complaint) => void;
  title?: string;
  initialFilter?: { priority?: Priority; status?: ComplaintStatus; category?: Category };
}

export const ComplaintsListView: React.FC<ComplaintsListViewProps> = ({
  complaints,
  onViewComplaint,
  title = "All Complaints Directory",
  initialFilter,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialFilter?.category || "all");
  const [priorityFilter, setPriorityFilter] = useState<string>(initialFilter?.priority || "all");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter?.status || "all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageComplaints, setPageComplaints] = useState<Complaint[]>(complaints);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage("");
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (departmentFilter !== "all") params.set("department", departmentFilter);
      if (dateFilter) params.set("date", dateFilter);
      try {
        const data = await apiGet<{ complaints: Complaint[]; total: number; totalPages: number }>(`/api/complaints?${params}`);
        setPageComplaints(data.complaints || []);
        setTotal(data.total || 0);
        setTotalPages(Math.max(1, data.totalPages || 1));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load complaints. Please try again.");
        setPageComplaints([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [page, search, categoryFilter, priorityFilter, statusFilter, departmentFilter, dateFilter]);

  const filteredComplaints = isLoading ? [] : pageComplaints;

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
    setDepartmentFilter("all");
    setDateFilter("");
    setPage(1);
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
              Showing {filteredComplaints.length} of {total} total logged complaints
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID, keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 focus:bg-white focus:border-[#146EF5]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
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
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
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
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <select
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl font-medium text-slate-700 focus:bg-white focus:border-[#146EF5]"
          >
            <option value="all">All Departments</option>
            {[...new Set(complaints.map(complaint => complaint.department))].filter(Boolean).map(department => <option key={department} value={department}>{department}</option>)}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl font-medium text-slate-700 focus:bg-white focus:border-[#146EF5]"
          />
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
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading complaints...</div>
          ) : errorMessage ? (
            <div className="p-12 text-center text-rose-600 text-xs">{errorMessage}</div>
          ) : filteredComplaints.length === 0 ? (
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

              return (
                <div
                  key={c.id}
                  onClick={() => onViewComplaint(c)}
                  className="p-4 hover:bg-blue-50/40 active:bg-blue-50/70 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
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
                        <p className="text-[10px] text-slate-400 truncate">
                          {c.studentRoll}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <PriorityBadge priority={c.priority} size="sm" />
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop / Tablet Table (sm+ screens) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Complaint Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Logged On</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400 text-xs">Loading complaints...</td></tr>
              ) : errorMessage ? (
                <tr><td colSpan={8} className="py-12 text-center text-rose-600 text-xs">{errorMessage}</td></tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
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

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onViewComplaint(c)}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        {c.id}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                            {c.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {c.studentName}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {c.studentRoll}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate" title={c.aiReason}>
                          {c.aiReason}
                        </p>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          {c.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-xs">
                        {formattedDate}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewComplaint(c);
                          }}
                          className="px-3 py-1 text-xs font-bold text-[#146EF5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E5EAF1] px-4 py-3 text-xs">
          <span className="text-slate-500">Page {page} of {totalPages} ({total} complaints)</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={page === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="p-2 rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};
