import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Category } from "../types";

interface CategoryDataPoint {
  name: Category | string;
  value: number;
  percentage: number;
  color: string;
}

interface CategoryPieChartProps {
  data: CategoryDataPoint[] | any[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
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
            <span className="font-extrabold">{item.name}</span>
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
          Complaint Categories
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
          Distribution across campus departments
        </p>
      </div>

      {/* Pie Chart & Legend Container */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
        {/* Pie Chart Area */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={58}
                paddingAngle={2}
                dataKey="value"
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cat-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List - Responsive Grid with Clean Spacing */}
        <div className="w-full flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-800 font-bold text-xs truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-slate-900 font-extrabold text-xs tabular-nums font-mono shrink-0 pl-1">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
