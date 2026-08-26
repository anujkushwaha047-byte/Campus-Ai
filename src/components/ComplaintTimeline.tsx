import React from "react";
import { TimelineItem, ComplaintStatus } from "../types";
import {
  CheckCircle2,
  Clock,
  Bot,
  UserCheck,
  Wrench,
  XCircle,
  FileCheck2,
  CircleDot
} from "lucide-react";

interface ComplaintTimelineProps {
  timeline: TimelineItem[];
  currentStatus: ComplaintStatus;
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({
  timeline,
  currentStatus,
}) => {
  const getStageIcon = (stage: string, isLast: boolean) => {
    switch (stage) {
      case "submitted":
        return <FileCheck2 className="w-4 h-4 text-blue-600" />;
      case "ai_analyzed":
        return <Bot className="w-4 h-4 text-purple-600" />;
      case "under_review":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "assigned":
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case "in_progress":
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <CircleDot className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case "submitted":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "ai_analyzed":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "under_review":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "assigned":
        return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "in_progress":
        return "bg-sky-50 border-sky-200 text-sky-700";
      case "resolved":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "rejected":
        return "bg-rose-50 border-rose-200 text-rose-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Standard Progression Steps Bar */}
      <div className="hidden sm:grid grid-cols-5 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-6">
        {[
          { label: "Submitted", active: true },
          { label: "AI Analysis", active: true },
          { label: "Review", active: currentStatus !== "Pending" },
          { label: "In Progress", active: currentStatus === "In Progress" || currentStatus === "Resolved" },
          { label: currentStatus === "Rejected" ? "Rejected" : "Resolved", active: currentStatus === "Resolved" || currentStatus === "Rejected" },
        ].map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 ${
                step.active
                  ? currentStatus === "Rejected" && idx === 4
                    ? "bg-rose-500 text-white"
                    : "bg-[#146EF5] text-white shadow-xs"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step.active ? idx + 1 : idx + 1}
            </div>
            <span
              className={`text-[11px] font-semibold truncate max-w-full ${
                step.active ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Detailed Activity Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((item, index) => {
          const isLatest = index === timeline.length - 1;
          const formattedTime = new Date(item.timestamp).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={item.id || index} className="relative group">
              {/* Timeline node icon */}
              <div
                className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center shadow-xs transition-transform ${
                  isLatest
                    ? "border-[#146EF5] ring-4 ring-blue-100 scale-110"
                    : "border-slate-300"
                }`}
              >
                {getStageIcon(item.stage, isLatest)}
              </div>

              {/* Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.title}
                    </h5>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${getStageBadgeColor(
                        item.stage
                      )}`}
                    >
                      {item.stage.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formattedTime}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  {item.description}
                </p>

                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-600">Logged by:</span>
                  <span>{item.actor}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
