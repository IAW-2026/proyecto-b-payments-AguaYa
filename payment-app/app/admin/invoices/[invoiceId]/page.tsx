import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";
import { fetchAdminInvoiceById } from "@/app/lib/data";

export const metadata: Metadata = { title: "Invoice Detail" };

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = await fetchAdminInvoiceById(invoiceId);
  if (!invoice) notFound();

  return (
    <main className="max-w-2xl">
      <h1 className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}>
        Invoice Detail
      </h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:divide-gray-700">
        <Row label="Invoice ID" value={invoiceId} mono />
        <Row label="Order ID" value={invoice.payment.orderId} mono />
        <Row label="Buyer" value={`${invoice.payment.buyerName} (${invoice.payment.buyerEmail})`} />
        <Row label="Seller" value={invoice.payment.sellerName} />
        <Row label="Payment method" value={invoice.payment.mpPaymentMethod ?? "—"} />
        <Row label="Status" value={invoice.payment.status} />
        <Row
          label="Issued at"
          value={invoice.issuedAt.toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
        <Row label="Subtotal" value={`$ ${invoice.subtotal.toLocaleString("es-AR")}`} />
        <Row label="IVA est. (21%)" value={`$ ${invoice.tax.toLocaleString("es-AR")}`} />
        <Row label="Total" value={`$ ${invoice.total.toLocaleString("es-AR")}`} bold />
      </div>
      <div className="mt-6">
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          download
          className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Download PDF
        </a>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  mono = false,
  bold = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between px-6 py-4 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`${bold ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"} ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
