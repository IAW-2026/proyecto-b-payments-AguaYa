import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { lusitana } from "@/app/ui/fonts";
import { fetchBuyerInvoiceById } from "@/app/lib/data";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  if (!profile?.buyerId) redirect("/select-role");

  const { invoiceId } = await params;
  const invoice = await fetchBuyerInvoiceById(invoiceId, profile.buyerId);

  if (!invoice) notFound();

  return (
    <main className="max-w-2xl">
      <h1 className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}>
        Invoice Detail
      </h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100">
        <Row label="Order ID" value={invoice.payment.orderId} mono />
        <Row label="Buyer" value={`${invoice.payment.buyerName} (${invoice.payment.buyerEmail})`} />
        <Row label="Payment method" value={invoice.payment.mpPaymentMethod ?? "—"} />
        <Row label="Issued at" value={invoice.issuedAt.toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })} />
        <Row label="Subtotal" value={`$ ${invoice.subtotal.toLocaleString("es-AR")}`} />
        <Row label="IVA (21%)" value={`$ ${invoice.tax.toLocaleString("es-AR")}`} />
        <Row label="Total" value={`$ ${invoice.total.toLocaleString("es-AR")}`} bold />
      </div>

      <div className="mt-6">
        <button
          disabled
          className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
        >
          Download PDF (coming soon)
        </button>
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
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? "font-semibold text-gray-900" : "text-gray-700"} ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
