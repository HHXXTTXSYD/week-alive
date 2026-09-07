"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
export function WorkChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <div
      className="work-chart"
      role="img"
      aria-label={`下班时间分布：${data.map((d) => `${d.name}${d.count}条`).join("，")}`}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -25, right: 5, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#edf0ee" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={(v) => [`${v} 条`, "员工反馈"]} />
          <Bar
            dataKey="count"
            fill="#32947b"
            radius={[5, 5, 0, 0]}
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
