import React from "react";
import { Sparkles, Bot, ShieldAlert, CheckCircle2, Clock, Building2, Zap } from "lucide-react";
import { Category, Priority } from "../types";
import { PriorityBadge } from "./PriorityBadge";

interface AIAnalysisCardProps {
  category: Category;
  priority: Priority;
  reason: string;
  confidence?: number;
  recommendedDepartment?: string;
  suggestedAction?: string;
  isAnalyzing?: boolean;
  timestamp?: string;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  category,
  priority,
  reason,
  confidence = 96,
  recommendedDepartment,
  suggestedAction,
  isAnalyzing = false,
  timestamp,
}) => {
  if (isAnalyzing) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-900/10 via-indigo-900/5 to-slate-900/5 border border-blue-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#146EF5] text-white flex items-center justify-center animate-pulse">
            <Bot className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>CampusCare AI Analyzing Complaint</span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </h4>
            <p className="text-xs text-slate-500">
              Evaluating hazard level, sentiment, category classification, and urgency SLA...
            </p>
          </div>
        </div>

        {/* Shimmer skeleton bar */}
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-blue-200/50 rounded-full w-3/4 animate-pulse" />
          <div className="h-3 bg-blue-200/30 rounded-full w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-[#061B3A] to-[#0A2750] text-white border border-[#0D3160] shadow-md relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 mb-5 border-b border-blue-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white tracking-tight">
                AI Complaint Analysis
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300 border border-blue-400/40 uppercase">
                Gemini Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Automated multi-factor risk assessment
            </p>
          </div>
        </div>

        {confidence && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/80 border border-blue-500/30 text-xs font-semibold text-blue-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{confidence}% Confidence</span>
          </div>
        )}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Category */}
        <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Assigned Category
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base">
              {category}
            </span>
          </div>
        </div>

        {/* Priority */}
        <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-xl p-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Assigned Priority
          </span>
          <div>
            <PriorityBadge priority={priority} size="md" showIcon />
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="bg-[#09254A]/90 border border-[#0D3160] rounded-xl p-4 mb-4">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          AI Triage Reasoning
        </span>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          "{reason}"
        </p>
      </div>

      {/* Recommended Department & Suggested Action */}
      {(recommendedDepartment || suggestedAction) && (
        <div className="space-y-2 text-xs text-slate-300 pt-1">
          {recommendedDepartment && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong className="text-white">Recommended Routing:</strong> {recommendedDepartment}
              </span>
            </div>
          )}
          {suggestedAction && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Recommended Action:</strong> {suggestedAction}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
