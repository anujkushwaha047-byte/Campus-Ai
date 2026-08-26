import React from "react";
import { Complaint } from "../types";
import { PriorityBadge, StatusBadge } from "./PriorityBadge";
import { ArrowRight, Eye, Calendar } from "lucide-react";

interface RecentComplaintsTableProps {
  complaints: Complaint[];
  onViewComplaint: (complaint: Complaint) => void;
  onViewAll?: () => void;
  title?: string;
  showViewAll?: boolean;
}

export const RecentComplaintsTable: React.FC<RecentComplaintsTableProps> = ({
  complaints,
  onViewComplaint,
  onViewAll,
  title = "Recent Complaints",
  showViewAll = true,
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
            Real-time feed with automated AI triage ratings
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

            return (
              <div
                key={c.id}
                onClick={() => onViewComplaint(c)}
                className="p-4 hover:bg-blue-50/40 active:bg-blue-50/70 transition-colors cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
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

                <p className="text-xs text-slate-600 line-clamp-1">
                  <span className="font-semibold text-slate-700">AI: </span>
                  {c.aiReason}
                </p>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewComplaint(c);
                    }}
                    className="px-3 py-1 text-xs font-bold text-[#146EF5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table (Visible on sm+ screens) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-6">ID</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">AI Reason</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
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

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => onViewComplaint(c)}
                  >
                    {/* ID */}
                    <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                      {c.id.startsWith("CMP-") ? `#${c.id.replace("CMP-", "")}` : `#${c.id}`}
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
                          <p className="text-[11px] text-slate-400">
                            {c.studentRoll}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                        {c.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap text-xs">
                      {formattedDate}
                    </td>

                    {/* AI Reason */}
                    <td className="py-4 px-4 text-slate-600 text-xs max-w-xs truncate" title={c.aiReason}>
                      {c.aiReason}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`btn-view-${c.id}`}
                          onClick={() => onViewComplaint(c)}
                          className="px-3 py-1 text-xs font-bold text-[#146EF5] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
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
