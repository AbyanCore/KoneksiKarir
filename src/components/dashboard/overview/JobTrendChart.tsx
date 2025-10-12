import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Cell,
} from "recharts";

interface JobTrendData {
  jobId: number;
  name: string;
  count: number;
  color?: string;
}

interface JobTrendChartProps {
  data: JobTrendData[];
}

export default function JobTrendChart({ data }: JobTrendChartProps) {
  // Color interpolation helpers
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
      .map((x) => {
        const h = x.toString(16);
        return h.length === 1 ? "0" + h : h;
      })
      .join("")}`;

  const interpolate = (aHex: string, bHex: string, t: number) => {
    const a = hexToRgb(aHex);
    const b = hexToRgb(bHex);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    return rgbToHex(r, g, bl);
  };

  // Calculate colors based on values
  const dataWithColors = data.map((item) => {
    const min = Math.min(...data.map((i) => i.count));
    const max = Math.max(...data.map((i) => i.count));
    const t = max === min ? 0.5 : (item.count - min) / (max - min);
    const light = "#e0e7ff"; // light indigo
    const dark = "#312e81"; // dark indigo
    const color = interpolate(light, dark, t);
    return { ...item, color };
  });

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Job Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Top 10 jobs by application volume
          </p>
        </div>
      </div>
      <div className="h-80 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dataWithColors}
            margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              label={{
                value: "Applications",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#64748b", fontSize: 12 },
              }}
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
              cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={800}>
              {dataWithColors.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
