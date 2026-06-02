import type { Metadata } from "next";
import { lusitana } from "@/app/ui/fonts";

export const metadata: Metadata = { title: "Dashboard" };
import {
  fetchPaymentStats,
  fetchMonthlyRevenue,
  countAllInvoices,
} from "@/app/lib/data";
import { fetchUserStats } from "@/app/lib/data";
import {
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UserIcon,
  NoSymbolIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import RevenueChart from "@/app/ui/shared/revenue-chart";
import StatusChart from "@/app/ui/shared/status-chart";

export default async function AdminDashboardPage() {

  const [paymentStats, userStats, monthlyRevenue, totalInvoices] =
    await Promise.all([
      fetchPaymentStats(),
      fetchUserStats(),
      fetchMonthlyRevenue(),
      countAllInvoices(),
    ]);

  const statusChartData = [
    { name: "Aprobados", value: paymentStats.approved, fill: "#22c55e" },
    { name: "Pendientes", value: paymentStats.pending, fill: "#eab308" },
    { name: "Rechazados", value: paymentStats.rejected, fill: "#ef4444" },
    { name: "Cancelados", value: paymentStats.cancelled, fill: "#6b7280" },
    { name: "Expirados", value: paymentStats.expired, fill: "#f97316" },
  ];

  return (
    <main>
      <h1 className={`${lusitana.className} mb-8 text-2xl font-bold md:text-3xl`}>
        Dashboard
      </h1>

      {/* Pagos */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
        Pagos
      </h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue total"
          value={`$${paymentStats.revenue.toLocaleString("es-AR")}`}
          icon={<CheckCircleIcon className="w-5 text-green-500" />}
          highlight
        />
        <StatCard
          label="Total pagos"
          value={paymentStats.total}
          icon={<CreditCardIcon className="w-5 text-gray-500" />}
        />
        <StatCard
          label="Total facturas"
          value={totalInvoices}
          icon={<DocumentTextIcon className="w-5 text-blue-500" />}
        />
        <StatCard
          label="Aprobados"
          value={paymentStats.approved}
          icon={<CheckCircleIcon className="w-5 text-green-500" />}
        />
        <StatCard
          label="Pendientes"
          value={paymentStats.pending}
          icon={<ClockIcon className="w-5 text-yellow-500" />}
        />
        <StatCard
          label="Rechazados"
          value={paymentStats.rejected}
          icon={<XCircleIcon className="w-5 text-red-500" />}
        />
        <StatCard
          label="Cancelados"
          value={paymentStats.cancelled}
          icon={<XCircleIcon className="w-5 text-gray-400" />}
        />
        <StatCard
          label="Expirados"
          value={paymentStats.expired}
          icon={<XCircleIcon className="w-5 text-orange-400" />}
        />
      </div>

      {/* Usuarios */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
        Usuarios
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total usuarios"
          value={userStats.total}
          icon={<UserGroupIcon className="w-5 text-gray-500" />}
        />
        <StatCard
          label="Activos"
          value={userStats.active}
          icon={<UserIcon className="w-5 text-green-500" />}
        />
        <StatCard
          label="Suspendidos"
          value={userStats.suspended}
          icon={<NoSymbolIcon className="w-5 text-yellow-500" />}
        />
        <StatCard
          label="Eliminados"
          value={userStats.deleted}
          icon={<TrashIcon className="w-5 text-red-400" />}
        />
      </div>

      {/* Gráficos */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
        Gráficos
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Facturación mensual (últimos 12 meses)
          </p>
          <RevenueChart data={monthlyRevenue} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Pagos por estado
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
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
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
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
