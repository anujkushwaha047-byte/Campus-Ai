import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Priority } from "../types";

interface PriorityDataPoint {
  name: Priority;
  value: number;
  percentage: number;
  color: string;
}

interface PriorityDonutChartProps {
  data: PriorityDataPoint[];
  totalComplaints: number;
}

export const PriorityDonutChart: React.FC<PriorityDonutChartProps> = ({
  data,
  totalComplaints,
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs z-50 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-extrabold">{item.name} Priority</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-4 text-[11px] text-slate-300">
            <span>Volume: <strong className="text-white font-mono">{item.value}</strong></span>
            <span>Share: <strong className="text-emerald-400 font-mono font-bold">{item.percentage}%</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5EAF1] shadow-xs flex flex-col justify-between h-full min-h-0">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          AI Priority Distribution
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
          Triage classification breakdown &amp; volume share
        </p>
      </div>

      {/* Donut & Legend Container - Responsive Stack/Flow for All Zoom Levels (100% to 250%) */}
      <div className="flex-1 flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
        {/* Recharts Donut Area with Centered Badge */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={58}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`priority-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none font-mono">
              {totalComplaints}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legend List - Ample Breathing Room & Structured Separation */}
        <div className="w-full flex-1 min-w-0 space-y-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 text-xs py-1.5 px-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all duration-150 group"
            >
              {/* Left Section: Dot + Priority Label + Count */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-800 font-bold text-xs truncate">
                  {item.name}
                </span>
                <span className="text-[11px] text-slate-400 font-medium font-mono shrink-0">
                  ({item.value})
                </span>
              </div>

              {/* Right Section: Percentage Share Badge */}
              <div className="flex items-center shrink-0 pl-2">
                <span className="text-slate-900 font-extrabold text-xs tabular-nums font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
