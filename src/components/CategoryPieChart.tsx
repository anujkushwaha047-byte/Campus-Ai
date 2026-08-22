import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Category } from "../types";

interface CategoryDataPoint {
  name: Category;
  value: number;
  percentage: number;
  color: string;
}

interface CategoryPieChartProps {
  data?: CategoryDataPoint[] | null;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = (data || []).filter((item) =>
    item && typeof item.name === "string" && Number.isFinite(item.value) && item.value >= 0
  );
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-bold text-slate-900">{item.name}</span>
          </div>
          <p className="text-slate-600 font-semibold mt-1">
            {item.value} complaints ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF1] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Complaint Categories
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Distribution across campus departments
        </p>
      </div>

      {/* Pie Chart & Legend Container */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 py-2">
        {/* Pie Chart Area */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          {chartData.length > 0 && chartData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={56}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cat-cell-${index}`} fill={entry.color || "#94A3B8"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-slate-400 text-center px-2">No category data</span>
          )}
        </div>

        {/* Legend List - 2 Column Clean List */}
        <div className="flex-1 min-w-0 w-full grid grid-cols-1 gap-y-1.5">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="min-w-0 grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-1 text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color || "#94A3B8" }} />
                <span className="min-w-0 truncate text-slate-700 font-semibold text-xs" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="w-10 text-right text-slate-900 font-bold text-xs tabular-nums">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
