import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { lusitana } from "@/app/ui/fonts";
import { fetchBuyerInvoices } from "@/app/lib/data";
import InvoicesTable from "@/app/ui/shared/invoices-table";

export default async function SellerInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  if (!profile?.sellerId) redirect("/select-role");

  const invoices = await fetchBuyerInvoices(profile.sellerId);

  return (
    <main>
      <h1
        className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}
      >
        My Invoices
      </h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <InvoicesTable invoices={invoices} role="seller" />
      </div>
    </main>
  );
}
