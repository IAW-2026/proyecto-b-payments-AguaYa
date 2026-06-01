import { lusitana } from "@/app/ui/fonts";
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
import RevenueChart from "@/app/ui/admin/revenue-chart";
import StatusChart from "@/app/ui/admin/status-chart";

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
      <h1 className={`${lusitana.className} mb-8 text-2xl font-bold md:text-3xl`}>
        Dashboard
      </h1>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Gráficos
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Ingresos mensuales (últimos 12 meses)
          </p>
          <RevenueChart data={monthlyRevenue} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
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
      className={`rounded-xl border p-4 shadow-sm ${
        highlight
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {subtitle && (
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
