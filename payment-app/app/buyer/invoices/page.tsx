import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { lusitana } from "@/app/ui/fonts";
import { fetchBuyerInvoicesPaged, countBuyerInvoices, PAGE_SIZE } from "@/app/lib/data";
import InvoicesTable from "@/app/ui/shared/invoices-table";
import Pagination from "@/app/ui/shared/pagination";
import SearchInput from "@/app/ui/shared/search-input";

type SearchParams = Promise<{ page?: string; query?: string }>;

export default async function BuyerInvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  if (!profile?.buyerId) redirect("/select-role");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const query = params.query;

  const [invoices, total] = await Promise.all([
    fetchBuyerInvoicesPaged(profile.buyerId, page, query),
    countBuyerInvoices(profile.buyerId, query),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}>
        My Invoices
      </h1>

      <Suspense>
        <SearchInput placeholder="Buscar por Order ID..." />
      </Suspense>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <InvoicesTable invoices={invoices} basePath="/buyer/invoices" />
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </main>
  );
}
