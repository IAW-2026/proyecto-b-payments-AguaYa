import Link from "next/link";
import { RecentInvoice } from "@/app/lib/definitions";

export default function InvoicesTable({ invoices }: { invoices: RecentInvoice[] }) {
  if (invoices.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        No invoices found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm dark:bg-gray-900">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Subtotal</th>
            <th className="px-4 py-3">IVA</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Issued At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800">
              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                <Link href={`/buyer/invoices/${invoice.id}`} className="hover:underline">
                  {invoice.payment.orderId}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                $ {invoice.subtotal.toLocaleString("es-AR")}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                $ {invoice.tax.toLocaleString("es-AR")}
              </td>
              <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                $ {invoice.total.toLocaleString("es-AR")}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {invoice.issuedAt.toLocaleDateString("es-AR", {
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
  );
}
