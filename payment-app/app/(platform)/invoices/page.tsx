import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Invoices" };
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { lusitana } from "@/app/ui/fonts";
import { getRole } from "@/app/lib/get-role";
import {
  fetchBuyerInvoicesPaged, countBuyerInvoices,
  fetchSellerInvoicesPaged, countSellerInvoices,
  PAGE_SIZE,
} from "@/app/lib/data";
import InvoicesTable from "@/app/ui/shared/invoices-table";
import Pagination from "@/app/ui/shared/pagination";
import SearchInput from "@/app/ui/shared/search-input";

type SearchParams = Promise<{ page?: string; query?: string }>;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = await getRole();
  if (!role) redirect("/select-role");

  const profile = await prisma.paymentUser.findUnique({
    where: { clerkId: userId },
  });

  const profileId = role === "buyer" ? profile?.buyerId : profile?.sellerId;
  if (!profileId) redirect("/select-role");

  const params = await searchParams;
  const page  = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const query = params.query;

  const fetchInvoices = role === "buyer" ? fetchBuyerInvoicesPaged : fetchSellerInvoicesPaged;
  const countInvoices = role === "buyer" ? countBuyerInvoices     : countSellerInvoices;

  const [invoices, total] = await Promise.all([
    fetchInvoices(profileId, page, query),
    countInvoices(profileId, query),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}>
        {role === "buyer" ? "Mis facturas" : "Mis facturas emitidas"}
      </h1>
      <div className="mb-6">
        <Suspense>
          <SearchInput placeholder="Buscar por Order ID..." />
        </Suspense>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <InvoicesTable invoices={invoices} basePath="/invoices" />
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </main>
  );
}
