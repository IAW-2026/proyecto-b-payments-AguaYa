"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type MonthlyRevenue = { month: string; revenue: number };

function formatMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("es-AR", {
    month: "short",
    year: "2-digit",
  });
}

export default function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center text-sm text-gray-400">
        Sin datos de facturación
      </div>
    );
  }

  const formatted = data.map((d) => ({ revenue: d.revenue, label: formatMonth(d.month) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v: number) =>
            v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
          }
        />
        <Tooltip
          formatter={(value) =>
            value !== undefined
              ? [`$${Number(value).toLocaleString("es-AR")}`, "Facturado"]
              : []
          }
        />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
