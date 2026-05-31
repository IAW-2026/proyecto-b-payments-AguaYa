import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import {
  fetchRecentSellerPayments,
  fetchRecentSellerInvoices,
} from "@/app/lib/data";
import RecentPayments from "@/app/ui/shared/recent-payments";
import RecentInvoices from "@/app/ui/shared/recent-invoices";

export default async function SellerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  // Si no tiene perfil o no es vendedor, volver al selector
  if (!profile?.sellerId) redirect("/select-role");

  const [payments, invoices] = await Promise.all([
    fetchRecentSellerPayments(profile.sellerId),
    fetchRecentSellerInvoices(profile.sellerId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <RecentPayments payments={payments} viewAllHref="/seller/payments" />

      <RecentInvoices invoices={invoices} viewAllHref="/seller/invoices" />
    </div>
  );
}
