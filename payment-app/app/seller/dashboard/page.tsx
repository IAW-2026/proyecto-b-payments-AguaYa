import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchRecentSellerPayments, fetchRecentSellerInvoices } from "@/app/lib/data";
import RecentPayments from "@/app/ui/shared/recent-payments";
import RecentInvoices from "@/app/ui/shared/recent-invoices";

export default async function SellerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [payments, invoices] = await Promise.all([
    fetchRecentSellerPayments(userId),
    fetchRecentSellerInvoices(userId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <RecentPayments
        payments={payments}
        viewAllHref="/seller/dashboard"
      />

      <RecentInvoices invoices={invoices} />
    </div>
  );
}
