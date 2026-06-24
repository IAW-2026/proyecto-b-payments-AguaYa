import {
  fetchSellerStats,
  fetchSellerMonthlyRevenue,
  fetchSellerTopProducts,
} from "@/app/lib/data";
import {
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import RevenueChart from "@/app/ui/shared/revenue-chart";
import StatusChart from "@/app/ui/shared/status-chart";

export default async function SellerDashboard({ sellerId }: { sellerId: string }) {
  const [stats, monthlyRevenue, topProducts] = await Promise.all([
    fetchSellerStats(sellerId),
    fetchSellerMonthlyRevenue(sellerId),
    fetchSellerTopProducts(sellerId),
  ]);

  const statusChartData = [
    { name: "Aprobadas",  value: stats.approved,  fill: "#22c55e" },
    { name: "Pendientes", value: stats.pending,   fill: "#eab308" },
    { name: "Rechazadas", value: stats.rejected,  fill: "#ef4444" },
    { name: "Canceladas", value: stats.cancelled, fill: "#6b7280" },
    { name: "Expiradas",  value: stats.expired,   fill: "#f97316" },
  ];

  return (
    <main>
      <h1 className="mb-8 text-2xl font-bold md:text-3xl text-[#E8EEF1]">
        Dashboard
      </h1>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#7FB3CC] tracking-[0.15em]">
        Resumen
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total cobrado"
          value={`$${stats.revenue.toLocaleString("es-AR")}`}
          icon={<CheckCircleIcon className="w-5 text-green-500" />}
          highlight
        />
        <StatCard
          label="Total ventas"
          value={stats.total}
          icon={<CreditCardIcon className="w-5 text-gray-500" />}
        />
        <StatCard
          label="Aprobadas"
          value={stats.approved}
          icon={<CheckCircleIcon className="w-5 text-green-500" />}
        />
        <StatCard
          label="Pendientes"
          value={stats.pending}
          icon={<ClockIcon className="w-5 text-yellow-500" />}
        />
        <StatCard
          label="Rechazadas"
          value={stats.rejected}
          icon={<XCircleIcon className="w-5 text-red-500" />}
        />
        <StatCard
          label="Canceladas"
          value={stats.cancelled}
          icon={<XCircleIcon className="w-5 text-gray-400" />}
        />
        <StatCard
          label="Expiradas"
          value={stats.expired}
          icon={<XCircleIcon className="w-5 text-orange-400" />}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#7FB3CC] tracking-[0.15em]">
        Productos
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Producto más vendido"
          value={topProducts.mostSold ? `${topProducts.mostSold.units} unidades` : "—"}
          subtitle={topProducts.mostSold?.name}
          icon={<ShoppingBagIcon className="w-5 text-blue-500" />}
        />
        <StatCard
          label="Mayor ingreso"
          value={
            topProducts.topRevenue
              ? `$${topProducts.topRevenue.amount.toLocaleString("es-AR")}`
              : "—"
          }
          subtitle={topProducts.topRevenue?.name}
          icon={<CurrencyDollarIcon className="w-5 text-green-500" />}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#7FB3CC] tracking-[0.15em]">
        Gráficos
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-[#1B4965] bg-[#0F2840] p-5">
          <p className="mb-4 text-sm font-medium text-[#7FB3CC]">
            Ingresos mensuales (últimos 12 meses)
          </p>
          <RevenueChart data={monthlyRevenue} />
        </div>
        <div className="border border-[#1B4965] bg-[#0F2840] p-5">
          <p className="mb-4 text-sm font-medium text-[#7FB3CC]">
            Ventas por estado
          </p>
          <StatusChart data={statusChartData} />
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight = false,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className={`border p-4 ${
        highlight
          ? "border-[#3DD6F0]/30 bg-[#1B4965]/50"
          : "border-[#1B4965] bg-[#0F2840]"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-[#7FB3CC]">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#E8EEF1]">{value}</p>
      {subtitle && (
        <p className="mt-1 truncate text-xs text-[#7FB3CC]">{subtitle}</p>
      )}
    </div>
  );
}
