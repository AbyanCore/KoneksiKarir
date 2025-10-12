import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartTooltip,
} from "recharts";

interface StatusData {
  name: string;
  value: number;
  [key: string]: any;
}

interface StatusChartProps {
  data: StatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  ACCEPTED: "#16a34a",
  REJECTED: "#dc2626",
  PENDING: "#f59e0b",
  UNKNOWN: "#6b7280",
};

export default function StatusChart({ data }: StatusChartProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Applications by Status
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status breakdown
          </p>
        </div>
      </div>
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={5}
              label
              labelLine={false}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name] ?? STATUS_COLORS.UNKNOWN}
                  stroke="white"
                  strokeWidth={3}
                />
              ))}
            </Pie>

            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
                fontWeight: 500,
              }}
              formatter={(value: any, entry: any) =>
                `${value} (${entry?.payload?.value ?? 0})`
              }
            />

            <RechartTooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                padding: "12px",
              }}
              labelStyle={{ fontWeight: 600, color: "#1e293b" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
