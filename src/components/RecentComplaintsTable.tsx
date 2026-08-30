import React from "react";
import { Complaint } from "../types";
import { PriorityBadge, StatusBadge } from "./PriorityBadge";
import { ArrowRight, Eye, CheckCircle2, Calendar, Check } from "lucide-react";

interface RecentComplaintsTableProps {
  complaints: Complaint[];
  onViewComplaint: (complaint: Complaint) => void;
  onResolveComplaint?: (complaint: Complaint) => void;
  onViewAll?: () => void;
  title?: string;
  showViewAll?: boolean;
  userRole?: string;
}

export const RecentComplaintsTable: React.FC<RecentComplaintsTableProps> = ({
  complaints,
  onViewComplaint,
  onResolveComplaint,
  onViewAll,
  title = "Recent Complaints",
  showViewAll = true,
  userRole = "admin",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-4 sm:p-6 border-b border-[#E5EAF1] flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Real-time feed with automated AI triage ratings and 1-click resolution
          </p>
        </div>

        {showViewAll && onViewAll && (
          <button
            id="btn-table-view-all"
            onClick={onViewAll}
            className="px-3 py-1.5 rounded-xl border border-blue-200 text-[#146EF5] hover:bg-blue-50 font-bold text-xs transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mobile Card List (Visible on < sm screens) */}
      <div className="sm:hidden divide-y divide-slate-100">
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No complaints found.
          </div>
        ) : (
          complaints.map((c) => {
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
                      {c.id.startsWith("CMP-") ? `#${c.id.replace("CMP-", "")}` : `#${c.id}`}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {c.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#146EF5] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {c.studentName.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">
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

                <div className="pt-1 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onViewComplaint(c)}
                    className="px-3 py-1 text-xs font-bold text-[#146EF5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  {userRole === "admin" && onResolveComplaint && !isResolved && (
                    <button
                      id={`btn-resolve-mobile-${c.id}`}
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

      {/* Desktop / Tablet Table (Visible on sm+ screens) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-6">Complaint ID</th>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No complaints found matching current filters.
                </td>
              </tr>
            ) : (
              complaints.map((c) => {
                const formattedDate = new Date(c.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const isResolved = c.status === "Resolved";

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => onViewComplaint(c)}
                  >
                    {/* Complaint ID */}
                    <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap font-mono">
                      {c.id.startsWith("CMP-") ? `#${c.id.replace("CMP-", "")}` : `#${c.id}`}
                    </td>

                    {/* Subject (Title) */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate" title={c.title}>
                        {c.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate" title={c.aiReason}>
                        <span className="font-semibold text-slate-500">AI:</span> {c.aiReason}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
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
                          className="px-3 py-1 text-xs font-bold text-[#146EF5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {userRole === "admin" && onResolveComplaint && (
                          !isResolved ? (
                            <button
                              id={`btn-resolve-${c.id}`}
                              onClick={() => onResolveComplaint(c)}
                              className="px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
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
  );
};
