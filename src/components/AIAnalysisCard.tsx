import React from "react";
import {
  Sparkles,
  Bot,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Building2,
  Zap,
  AlertTriangle,
  Flame,
  Droplets,
  Shield,
  Activity,
  Layers,
  FileText
} from "lucide-react";
import { Category, Priority } from "../types";
import { PriorityBadge } from "./PriorityBadge";

export interface AIAnalysisCardProps {
  category: Category | string;
  subcategory?: string;
  priority: Priority;
  severity?: Priority;
  reason: string;
  summary?: string;
  department?: string;
  recommendedDepartment?: string;
  suggestedAction?: string;
  recommendedAction?: string;
  riskFlags?: string[];
  urgencyScore?: number;
  confidence?: number | null;
  isAnalyzing?: boolean;
  timestamp?: string;
}

// Visual risk flag metadata
const RISK_FLAG_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  fire: { label: "Fire Hazard", icon: "🔥", bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40" },
  smoke: { label: "Smoke Detected", icon: "💨", bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/40" },
  gas_leak: { label: "Gas Leakage Alert", icon: "⚠️", bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40" },
  electrical_hazard: { label: "Electrical Hazard", icon: "⚡", bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40" },
  water_contamination: { label: "Water Contamination", icon: "💧", bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/40" },
  sewage: { label: "Sewage Overflow", icon: "☣️", bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40" },
  food_contamination: { label: "Food Contamination", icon: "🍽️", bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40" },
  security_risk: { label: "Security Risk", icon: "🛡️", bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/40" },
  structural_damage: { label: "Structural Damage", icon: "🏚️", bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/40" },
  health_hygiene: { label: "Health & Hygiene Risk", icon: "🧹", bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40" },
  internet_outage: { label: "Network Outage", icon: "📶", bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/40" },
};

// Category Icon helper
function getCategoryIcon(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("fire") || c.includes("safety")) return "🔥";
  if (c.includes("electr")) return "⚡";
  if (c.includes("water")) return "💧";
  if (c.includes("food") || c.includes("mess")) return "🍽️";
  if (c.includes("wi-fi") || c.includes("internet") || c.includes("network")) return "📶";
  if (c.includes("plumb") || c.includes("bath")) return "🚿";
  if (c.includes("clean") || c.includes("hygiene")) return "🧹";
  if (c.includes("hostel") || c.includes("room")) return "🏠";
  if (c.includes("security")) return "🛡️";
  if (c.includes("lift") || c.includes("elevator")) return "🛗";
  if (c.includes("classroom") || c.includes("academic")) return "🏫";
  if (c.includes("computer") || c.includes("lab")) return "💻";
  if (c.includes("park") || c.includes("transport")) return "🅿️";
  if (c.includes("sport") || c.includes("gym")) return "🏃";
  if (c.includes("environment")) return "🌳";
  if (c.includes("staff")) return "👨‍💼";
  return "📢";
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  category,
  subcategory,
  priority,
  severity,
  reason,
  summary,
  department,
  recommendedDepartment,
  suggestedAction,
  recommendedAction,
  riskFlags = [],
  urgencyScore,
  confidence,
  isAnalyzing = false,
}) => {
  const effectivePriority = severity || priority || "Medium";
  const effectiveDepartment = department || recommendedDepartment || "Campus Administration";
  const effectiveAction = recommendedAction || suggestedAction;
  const isEmergency = effectivePriority === "Critical" || riskFlags.some(r => ["fire", "smoke", "gas_leak", "electrical_hazard"].includes(r));

  if (isAnalyzing) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-900/10 via-indigo-900/5 to-slate-900/5 border border-blue-200/80 shadow-xs relative overflow-hidden animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#146EF5] text-white flex items-center justify-center">
            <Bot className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Gemini AI Triage Engine Analyzing Complaint</span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </h4>
            <p className="text-xs text-slate-500">
              Evaluating category, hazard severity, responsible department, and emergency safety recommendations...
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-3 bg-blue-200/50 rounded-full w-3/4" />
          <div className="h-3 bg-blue-200/30 rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-[#061B3A] to-[#0A2750] text-white border border-[#0D3160] shadow-xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-blue-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                AI Complaint Intelligence Report
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300 border border-blue-400/40 uppercase">
                Gemini 3.7
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Automated category classification, hazard triage &amp; departmental routing
            </p>
          </div>
        </div>

        {/* Confidence or Urgency Badge */}
        <div className="flex items-center gap-2">
          {urgencyScore !== undefined && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/80 border border-blue-500/30 text-xs font-bold text-blue-200">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Urgency: {urgencyScore}/100</span>
            </div>
          )}

          {confidence !== undefined && confidence !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-xs font-bold text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{confidence}% Confidence</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Signs / Risk Flags Bar (if any) */}
      {riskFlags && riskFlags.length > 0 && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-rose-300 text-xs font-extrabold mr-1">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Active Risk Signs:</span>
          </div>
          {riskFlags.map((flag) => {
            const conf = RISK_FLAG_CONFIG[flag] || { label: flag.replace(/_/g, " "), icon: "⚠️", bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/40" };
            return (
              <span
                key={flag}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${conf.bg} ${conf.text} border ${conf.border} shadow-xs`}
              >
                <span>{conf.icon}</span>
                <span>{conf.label}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Primary Triage Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Category & Subcategory */}
        <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Category &amp; Issue Type
          </span>
          <div className="flex items-start gap-2">
            <span className="text-xl shrink-0">{getCategoryIcon(category)}</span>
            <div className="min-w-0">
              <p className="font-extrabold text-white text-sm truncate">
                {category}
              </p>
              {subcategory && subcategory !== "Unknown" && (
                <p className="text-xs text-blue-300 font-semibold truncate mt-0.5">
                  ↳ {subcategory}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Severity / Priority */}
        <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Assigned Severity
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={effectivePriority} size="md" showIcon />
          </div>
        </div>

        {/* Responsible Department */}
        <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-2xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Responsible Department
          </span>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
            <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">{effectiveDepartment}</span>
          </div>
        </div>
      </div>

      {/* AI Summary (if available) */}
      {summary && (
        <div className="bg-[#09254A]/90 border border-[#0D3160] rounded-2xl p-3.5 mb-3">
          <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Executive Complaint Summary
          </span>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
            {summary}
          </p>
        </div>
      )}

      {/* AI Reasoning */}
      <div className="bg-[#09254A]/90 border border-[#0D3160] rounded-2xl p-4 mb-3">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          AI Triage Reasoning &amp; Context
        </span>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          "{reason}"
        </p>
      </div>

      {/* Recommended Departmental & Safety Action */}
      {effectiveAction && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
          isEmergency
            ? "bg-rose-950/30 border-rose-500/40 text-rose-100"
            : "bg-emerald-950/30 border-emerald-500/40 text-emerald-100"
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            {isEmergency ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className={isEmergency ? "text-rose-300" : "text-emerald-300"}>
              {isEmergency ? "Immediate Safety & Emergency Action:" : "Recommended Departmental Action:"}
            </span>
          </div>
          <p className="text-slate-200">
            {effectiveAction}
          </p>
        </div>
      )}
    </div>
  );
};
