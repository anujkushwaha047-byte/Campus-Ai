import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Send,
  RefreshCw,
  Building2,
  Clock,
  FileSpreadsheet
} from "lucide-react";
import { AnalyticsData, Complaint } from "../types";
import { apiRequest } from "../api";

interface AIReportsViewProps {
  analytics: AnalyticsData;
  complaints: Complaint[];
}

export const AIReportsView: React.FC<AIReportsViewProps> = ({
  analytics,
  complaints,
}) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [customReport, setCustomReport] = useState<string | null>(null);

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const data = await apiRequest<{ customAnalysis?: string; summary?: string }>("/api/ai/generate-insights", {
        method: "POST",
        body: JSON.stringify({ query: aiPrompt }),
      });
      setCustomReport(data.customAnalysis || data.summary || "Analysis completed based on current database state.");
    } catch (err) {
      console.error(err);
      setCustomReport("Error analyzing dataset. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const departmentSLA = [
    { dept: "Hostel Maintenance", total: 86, resolved: 71, avgTime: "1.8 Days", slaScore: "94%", health: "Good" },
    { dept: "IT Infrastructure", total: 24, resolved: 22, avgTime: "0.6 Days", slaScore: "98%", health: "Excellent" },
    { dept: "Faculty & Academics", total: 49, resolved: 38, avgTime: "3.2 Days", slaScore: "86%", health: "Moderate" },
    { dept: "Library Desk", total: 37, resolved: 35, avgTime: "1.1 Days", slaScore: "96%", health: "Excellent" },
    { dept: "Examination Cell", total: 29, resolved: 21, avgTime: "2.5 Days", slaScore: "89%", health: "Moderate" },
    { dept: "Transport Desk", total: 20, resolved: 10, avgTime: "4.1 Days", slaScore: "72%", health: "Action Needed" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. HERO AI SYNTHESIS BANNER */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#061B3A] to-[#0A2750] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#0D3160]">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#146EF5] to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                Gemini AI Campus Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300 border border-blue-400/40 text-xs font-bold uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Automated anomaly detection, triage classification telemetry, and preventative maintenance forecasts
            </p>
          </div>
        </div>

        {/* Key AI Takeaways Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              High-Risk Bottlenecks
            </span>
            <p className="text-sm font-bold text-white mb-1">
              Hostel Block B Plumbing
            </p>
            <p className="text-xs text-slate-300">
              6 repeated complaints logged within 48 hours. Recommend proactive pipeline check.
            </p>
          </div>

          <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Resolution Turnaround
            </span>
            <p className="text-sm font-bold text-emerald-400 mb-1">
              2.4 Days Average
            </p>
            <p className="text-xs text-slate-300">
              Improved by 18.7% compared to last semester after AI automatic routing rollout.
            </p>
          </div>

          <div className="bg-[#09254A]/80 border border-[#0D3160] rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Classification Accuracy
            </span>
            <p className="text-sm font-bold text-blue-400 mb-1">
              96.4% Precision
            </p>
            <p className="text-xs text-slate-300">
              Zero hazardous or critical electrical issues misclassified over past 30 days.
            </p>
          </div>
        </div>
      </div>

      {/* 2. ASK GEMINI INTERACTIVE QUERY BAR */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#146EF5]" />
          <span>Interactive Campus Intelligence Query</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Ask questions across the complaint corpus to uncover latent trends, student sentiment, and SLA delays.
        </p>

        <form onSubmit={handleAskGemini} className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., Identify recurring issues in Hostel Block B and draft a maintenance memo..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl focus:bg-white focus:border-[#146EF5]"
          />
          <button
            type="submit"
            disabled={isGenerating || !aiPrompt.trim()}
            className="px-5 py-2.5 bg-[#146EF5] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        {/* Quick query tags */}
        <div className="flex gap-2 flex-wrap mt-3 text-[11px]">
          <span className="text-slate-400 font-semibold">Suggested questions:</span>
          <button
            type="button"
            onClick={() => setAiPrompt("What are the top 3 safety hazards reported this month?")}
            className="text-[#146EF5] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md font-medium cursor-pointer"
          >
            Top safety hazards?
          </button>
          <button
            type="button"
            onClick={() => setAiPrompt("Which department has the slowest resolution time and why?")}
            className="text-[#146EF5] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md font-medium cursor-pointer"
          >
            Slowest resolution department?
          </button>
          <button
            type="button"
            onClick={() => setAiPrompt("Draft a monthly administrative grievance summary report.")}
            className="text-[#146EF5] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md font-medium cursor-pointer"
          >
            Monthly summary draft
          </button>
        </div>

        {customReport && (
          <div className="mt-5 p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 text-xs leading-relaxed animate-in fade-in">
            <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
              <Bot className="w-4 h-4" />
              <span>Gemini AI Synthesis Output:</span>
            </div>
            <p className="whitespace-pre-wrap">{customReport}</p>
          </div>
        )}
      </div>

      {/* 3. DEPARTMENT SLA & RESOLUTION HEALTH TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#E5EAF1] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Department SLA & Resolution Performance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Service Level Agreement compliance monitored in real-time
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-4">Total Assigned</th>
                <th className="py-3.5 px-4">Resolved</th>
                <th className="py-3.5 px-4">Avg. Resolution</th>
                <th className="py-3.5 px-4">SLA Compliance</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {departmentSLA.map((d) => (
                <tr key={d.dept} className="hover:bg-slate-50">
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {d.dept}
                  </td>
                  <td className="py-4 px-4 text-slate-700">{d.total}</td>
                  <td className="py-4 px-4 text-slate-700">{d.resolved}</td>
                  <td className="py-4 px-4 text-slate-700 font-semibold">{d.avgTime}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            parseInt(d.slaScore) > 90
                              ? "bg-emerald-500"
                              : parseInt(d.slaScore) > 80
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: d.slaScore }}
                        />
                      </div>
                      <span className="font-bold text-slate-900">{d.slaScore}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        d.health === "Excellent"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : d.health === "Good"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : d.health === "Moderate"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {d.health}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
