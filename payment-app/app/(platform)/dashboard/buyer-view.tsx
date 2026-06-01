import { fetchRecentBuyerPayments, fetchRecentBuyerInvoices } from "@/app/lib/data";
import RecentPayments from "@/app/ui/shared/recent-payments";
import RecentInvoices from "@/app/ui/shared/recent-invoices";

export default async function BuyerDashboard({ buyerId }: { buyerId: string }) {
  const [payments, invoices] = await Promise.all([
    fetchRecentBuyerPayments(buyerId),
    fetchRecentBuyerInvoices(buyerId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <RecentPayments payments={payments} viewAllHref="/payments" />
      <RecentInvoices invoices={invoices} viewAllHref="/invoices" />
    </div>
  );
}
