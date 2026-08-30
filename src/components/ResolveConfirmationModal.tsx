import React, { useState } from "react";
import { CheckCircle2, AlertCircle, X, RefreshCw, ShieldCheck } from "lucide-react";
import { Complaint } from "../types";
import { PriorityBadge, StatusBadge } from "./PriorityBadge";

interface ResolveConfirmationModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  onClose: () => void;
  onConfirmResolve: (complaintId: string, resolutionNote?: string) => Promise<void>;
}

export const ResolveConfirmationModal: React.FC<ResolveConfirmationModalProps> = ({
  isOpen,
  complaint,
  onClose,
  onConfirmResolve,
}) => {
  const [resolutionNote, setResolutionNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !complaint) return null;

  const handleConfirm = async () => {
    setErrorMsg("");
    setIsResolving(true);
    try {
      await onConfirmResolve(complaint.id, resolutionNote.trim());
      setResolutionNote("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to mark complaint as resolved.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5EAF1] bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Resolve Complaint
              </h3>
              <p className="text-xs text-slate-500">
                Confirm resolution of this student grievance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isResolving}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              Are you sure you want to mark this complaint as resolved?
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will update the complaint status to <strong className="text-emerald-600">Resolved</strong>, timestamp the resolution, append an audit log entry to the timeline, and notify the student.
            </p>
          </div>

          {/* Target Complaint Summary Card */}
          <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs font-mono">
                  {complaint.id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#146EF5] font-bold text-[11px] border border-blue-200">
                  {complaint.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <PriorityBadge priority={complaint.priority} size="sm" />
                <StatusBadge status={complaint.status} size="sm" />
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
              {complaint.title}
            </h4>

            <div className="flex items-center justify-between text-slate-500 pt-1 text-[11px]">
              <span>Student: <strong className="text-slate-700">{complaint.studentName}</strong> ({complaint.studentRoll})</span>
              <span>Logged: {new Date(complaint.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          {/* Optional Resolution Remark */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Resolution Note / Action Taken (Optional)
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g., Electrician dispatched and replaced the faulty switchboard in Room 204. Issue verified resolved."
              className="w-full p-3 text-xs bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 focus:bg-white focus:border-[#146EF5] focus:ring-1 focus:ring-blue-100 focus:outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#E5EAF1] bg-slate-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isResolving}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isResolving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isResolving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Resolving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolve</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
