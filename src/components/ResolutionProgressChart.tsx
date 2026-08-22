import React, { useState } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface DataPoint {
  date: string;
  resolved: number;
  target?: number;
}

interface ResolutionProgressChartProps {
  data?: DataPoint[] | null;
}

export const ResolutionProgressChart: React.FC<ResolutionProgressChartProps> = ({
  data,
}) => {
  const [timeframe, setTimeframe] = useState("This Month");
  const chartData = (data || []).filter((item) =>
    item && typeof item.date === "string" && Number.isFinite(item.resolved) && item.resolved >= 0
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-lg text-xs">
          <p className="font-bold text-slate-900">{label}</p>
          <p className="text-[#146EF5] font-semibold mt-0.5">
            Resolved: <span className="font-extrabold">{payload[0].value}</span>
          </p>
          {payload[1] && (
            <p className="text-slate-400 text-[11px]">
              Target: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5EAF1] shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Complaint Resolution Progress
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cumulative resolved cases over timeline
          </p>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#146EF5] cursor-pointer"
          >
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="Quarterly">Quarterly</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="w-full flex-1 min-h-[220px] sm:min-h-[250px] pt-2">
        {chartData.length === 0 ? (
          <div className="h-full min-h-[220px] flex items-center justify-center text-xs text-slate-400">No resolution data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#146EF5" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#146EF5" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="resolved"
              stroke="#146EF5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorResolved)"
              dot={{
                r: 4,
                fill: "#FFFFFF",
                stroke: "#146EF5",
                strokeWidth: 2.5,
              }}
              activeDot={{
                r: 6,
                fill: "#146EF5",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
