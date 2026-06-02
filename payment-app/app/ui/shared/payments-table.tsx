import clsx from "clsx";
import { Payment, PaymentStatus } from "@/app/lib/definitions";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  approved:  "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  rejected:  "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  expired:   "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending:   "Pending",
  approved:  "Approved",
  rejected:  "Rejected",
  cancelled: "Cancelled",
  expired:   "Expired",
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

export default function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        No payments found for the selected filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm dark:bg-gray-900">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Payment Method</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800">
              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                {payment.orderId}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {payment.sellerName ?? payment.buyerName ?? "—"}
              </td>
              <td className="px-4 py-3 font-medium dark:text-gray-100">
                $ {payment.amount.toLocaleString("es-AR")}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={payment.status} />
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {payment.createdAt.toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {payment.mpPaymentMethod ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
