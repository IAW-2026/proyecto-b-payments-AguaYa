"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StatusEntry = { name: string; value: number; fill: string };

export default function StatusChart({ data }: { data: StatusEntry[] }) {
  const filtered = data.filter((d) => d.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-gray-400">
        Sin datos
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          paddingAngle={2}
        >
          {filtered.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            value !== undefined ? [Number(value), "Pagos"] : []
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
