import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
} from "recharts";

interface EducationData {
  level: string;
  count: number;
}

interface EducationChartProps {
  data: EducationData[];
}

export default function EducationChart({ data }: EducationChartProps) {
  // Sort data in a specific order
  const orderedData = [...data].sort((a, b) => {
    const order = ["SMA", "D3", "S1", "S2", "S3", "Unknown"];
    return order.indexOf(a.level) - order.indexOf(b.level);
  });

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Education Demographics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Applicants by education level
          </p>
        </div>
      </div>
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={orderedData}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="level"
              tick={{ fontSize: 13, fill: "#64748b", fontWeight: 500 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <RechartTooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                padding: "12px",
              }}
              cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
            />
            <Bar
              dataKey="count"
              fill="url(#educationGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
            <defs>
              <linearGradient
                id="educationGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
