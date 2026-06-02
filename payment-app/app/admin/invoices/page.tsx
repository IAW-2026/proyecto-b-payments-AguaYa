import type { Metadata } from "next";
import { Suspense } from "react";
import { lusitana } from "@/app/ui/fonts";

export const metadata: Metadata = { title: "Invoices" };
import { fetchAllInvoices, countAllInvoices, PAGE_SIZE } from "@/app/lib/data";
import InvoicesTable from "@/app/ui/shared/invoices-table";
import SearchInput from "@/app/ui/shared/search-input";
import Pagination from "@/app/ui/shared/pagination";

type SearchParams = Promise<{ query?: string; page?: string }>;

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const query = params.query;

  const [invoices, total] = await Promise.all([
    fetchAllInvoices(query, page),
    countAllInvoices(query),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}>
        Invoices
      </h1>

      <Suspense>
        <SearchInput placeholder="Buscar por Order ID..." />
      </Suspense>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <InvoicesTable invoices={invoices} basePath="/admin/invoices" />
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </main>
  );
}
