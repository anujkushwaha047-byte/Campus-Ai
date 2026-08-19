import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  id?: string;
  title: string;
  value: number | string;
  changePct: number;
  comparisonText?: string;
  icon: LucideIcon;
  variant: "blue" | "orange" | "green" | "red";
  onClick?: () => void;
  isActive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  changePct,
  comparisonText = "from last month",
  icon: Icon,
  variant,
  onClick,
  isActive = false,
}) => {
  const variantStyles = {
    blue: {
      iconBg: "bg-[#146EF5]",
      iconColor: "text-white",
      cardBorder: "border-[#E5EAF1] hover:border-[#146EF5]/30",
      activeRing: "ring-2 ring-[#146EF5]/20 border-[#146EF5]",
    },
    orange: {
      iconBg: "bg-[#F59E0B]",
      iconColor: "text-white",
      cardBorder: "border-[#E5EAF1] hover:border-[#F59E0B]/30",
      activeRing: "ring-2 ring-[#F59E0B]/20 border-[#F59E0B]",
    },
    green: {
      iconBg: "bg-[#10B981]",
      iconColor: "text-white",
      cardBorder: "border-[#E5EAF1] hover:border-[#10B981]/30",
      activeRing: "ring-2 ring-[#10B981]/20 border-[#10B981]",
    },
    red: {
      iconBg: "bg-[#EF4444]",
      iconColor: "text-white",
      cardBorder: "border-[#E5EAF1] hover:border-[#EF4444]/30",
      activeRing: "ring-2 ring-[#EF4444]/20 border-[#EF4444]",
    },
  };

  const currentVariant = variantStyles[variant];
  const isPositive = changePct >= 0;

  // In complaint context, if pending/critical decreases, that's good (green trend), or if resolved increases that's good.
  const isGoodTrend =
    (variant === "blue" || variant === "green") ? isPositive : !isPositive;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 sm:p-6 border shadow-xs transition-all duration-200 ${
        currentVariant.cardBorder
      } ${isActive ? currentVariant.activeRing : ""} ${
        onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      }`}
    >
      {/* Top Header: Title & Value on Left (Front), Icon on Right */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider leading-snug">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mt-2">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
        </div>

        {/* Large Rounded Icon Box */}
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${currentVariant.iconBg} ${currentVariant.iconColor}`}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
        </div>
      </div>

      {/* Bottom Trend Row */}
      <div className="flex items-center gap-1.5 text-xs font-medium pt-1">
        <span
          className={`inline-flex items-center font-bold ${
            isGoodTrend ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
          )}
          {Math.abs(changePct)}%
        </span>
        <span className="text-slate-400 font-normal">
          {comparisonText}
        </span>
      </div>
    </div>
  );
};
