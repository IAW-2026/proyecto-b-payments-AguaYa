import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";
import { prisma } from "@/app/lib/prisma";
import { fetchSellerPayments, countSellerPayments, PAGE_SIZE } from "@/app/lib/data";
import { PaymentStatus } from "@/app/lib/definitions";
import PaymentsTable from "@/app/ui/shared/payments-table";
import PaymentsFilters from "@/app/ui/shared/payments-filters";
import Pagination from "@/app/ui/shared/pagination";

type SearchParams = Promise<{
  status?: string;
  from?: string;
  to?: string;
  query?: string;
  page?: string;
}>;

const VALID_STATUSES: PaymentStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "expired",
];

export default async function SellerPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  if (!profile?.sellerId) redirect("/select-role");

  const params = await searchParams;

  const status = VALID_STATUSES.includes(params.status as PaymentStatus)
    ? (params.status as PaymentStatus)
    : undefined;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters = { status, from: params.from, to: params.to, query: params.query };

  const [payments, total] = await Promise.all([
    fetchSellerPayments(profile.sellerId, { ...filters, page }),
    countSellerPayments(profile.sellerId, filters),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <h1 className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}>
        My Payments
      </h1>

      <div className="mb-6">
        <Suspense>
          <PaymentsFilters />
        </Suspense>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <PaymentsTable payments={payments} />
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </main>
  );
}
