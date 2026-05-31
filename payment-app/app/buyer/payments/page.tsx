import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";
import { fetchBuyerPayments } from "@/app/lib/data";
import { PaymentStatus } from "@/app/lib/definitions";
import PaymentsTable from "@/app/ui/buyer/payments-table";
import PaymentsFilters from "@/app/ui/buyer/payments-filters";

type SearchParams = Promise<{
  status?: string;
  from?: string;
  to?: string;
}>;

const VALID_STATUSES: PaymentStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "expired",
];

export default async function BuyerPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const status = VALID_STATUSES.includes(params.status as PaymentStatus)
    ? (params.status as PaymentStatus)
    : undefined;

  const payments = await fetchBuyerPayments(userId, {
    status,
    from: params.from,
    to: params.to,
  });

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

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <PaymentsTable payments={payments} />
      </div>
    </main>
  );
}
