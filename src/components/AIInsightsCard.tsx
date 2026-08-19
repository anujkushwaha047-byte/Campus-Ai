import React from "react";
import {
  Bot,
  AlertTriangle,
  TrendingUp,
  Clock,
  TrendingDown,
  Sparkles,
  ArrowRight,
  RefreshCw
} from "lucide-react";

interface InsightItem {
  id?: string;
  type: "critical" | "increase" | "resolution" | "decrease" | "ai_tip";
  iconType: "alert" | "trend_up" | "clock" | "trend_down" | "sparkles";
  text: string;
  highlightText?: string;
}

interface AIInsightsCardProps {
  insights: InsightItem[];
  onViewDetailedReport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  insights,
  onViewDetailedReport,
  onRefresh,
  isRefreshing = false,
}) => {
  const getIcon = (iconType: string, type: string) => {
    switch (iconType) {
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
      case "trend_up":
        return <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />;
      case "clock":
        return <Clock className="w-5 h-5 text-emerald-600 shrink-0" />;
      case "trend_down":
        return <TrendingDown className="w-5 h-5 text-purple-600 shrink-0" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-100";
      case "increase":
        return "bg-blue-50 border-blue-100";
      case "resolution":
        return "bg-emerald-50 border-emerald-100";
      case "decrease":
        return "bg-purple-50 border-purple-100";
      default:
        return "bg-amber-50 border-amber-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#146EF5]">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              AI Insights
            </h3>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Refresh AI insights"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#146EF5]" : ""}`} />
            </button>
          )}
        </div>

        {/* Insight Items */}
        <div className="space-y-3.5">
          {insights.map((item, idx) => {
            return (
              <div
                key={item.id || idx}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
              >
                <div className={`p-1.5 rounded-lg border ${getBadgeStyle(item.type)} mt-0.5`}>
                  {getIcon(item.iconType, item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-4 border-t border-slate-100">
        <button
          id="btn-view-ai-report"
          onClick={onViewDetailedReport}
          className="w-full py-2.5 px-4 rounded-xl border border-blue-200 text-[#146EF5] hover:bg-blue-50 font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-2xs"
        >
          <span>View Detailed AI Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
