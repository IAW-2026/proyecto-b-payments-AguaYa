import Link from "next/link";
import clsx from "clsx";
import { RecentPayment, PaymentStatus } from "@/app/lib/definitions";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  approved:  "bg-green-100 text-green-800",
  rejected:  "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
  expired:   "bg-orange-100 text-orange-800",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending:   "Pendiente",
  approved:  "Aprobado",
  rejected:  "Rechazado",
  cancelled: "Cancelado",
  expired:   "Expirado",
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

interface RecentPaymentsProps {
  payments: RecentPayment[];
  /** Link para el botón "Ver todas" */
  viewAllHref: string;
}

export default function RecentPayments({
  payments,
  viewAllHref,
}: RecentPaymentsProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800">
          Últimas transacciones
        </h2>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          Ver todas →
        </Link>
      </div>

      {/* Contenido */}
      {payments.length === 0 ? (
        <div className="px-6 py-10 text-center text-sm text-gray-500">
          Todavía no hay pagos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">
                    {payment.orderId}
                  </td>
                  <td className="px-6 py-3 font-semibold text-gray-800">
                    $ {payment.amount.toLocaleString("es-AR")}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {payment.createdAt.toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
