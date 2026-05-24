import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { fetchRecentBuyerPayments, fetchRecentBuyerInvoices } from "@/app/lib/data";
import RecentPayments from "@/app/ui/shared/recent-payments";
import RecentInvoices from "@/app/ui/shared/recent-invoices";

export default async function BuyerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  // Si no tiene perfil o no es comprador, volver al selector
  if (!profile?.buyerId) redirect("/select-role");

  const [payments, invoices] = await Promise.all([
    fetchRecentBuyerPayments(profile.buyerId),
    fetchRecentBuyerInvoices(profile.buyerId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <RecentPayments
        payments={payments}
        viewAllHref="/buyer/payments"
      />

      <RecentInvoices invoices={invoices} />
    </div>
  );
}
