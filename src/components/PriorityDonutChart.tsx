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
          AI Priority Distribution
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Triage classification breakdown
        </p>
      </div>

      {/* Donut & Legend Container - Centered Vertically */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 py-2">
        {/* Recharts Donut */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={56}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-extrabold text-slate-900 leading-tight">
              {totalComplaints}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 min-w-0 w-full space-y-1.5">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 font-semibold text-xs whitespace-nowrap">
                  {item.name}
                </span>
              </div>
              <span className="text-slate-900 font-bold shrink-0 text-xs tabular-nums ml-2">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
