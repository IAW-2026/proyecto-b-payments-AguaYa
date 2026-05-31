import clsx from "clsx";
import { BuyerPayment, PaymentStatus } from "@/app/lib/definitions";

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  approved:  "bg-green-100 text-green-800",
  rejected:  "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700",
  expired:   "bg-orange-100 text-orange-800",
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

export default function PaymentsTable({ payments }: { payments: BuyerPayment[] }) {
  if (payments.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500">
        No payments found for the selected filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Payment Method</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {payment.orderId}
              </td>
              <td className="px-4 py-3 font-medium">
                $ {payment.amount.toLocaleString("es-AR")}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={payment.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {payment.createdAt.toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {payment.mpPaymentMethod ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
