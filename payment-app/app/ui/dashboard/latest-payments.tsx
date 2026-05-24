import { RecentPayment } from "@/app/lib/definitions";
import { lusitana } from "@/app/ui/fonts";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default async function LatestPayments({
  latestPayments,
}: {
  latestPayments: RecentPayment[];
}) {
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Payments
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {latestPayments.map((payment, i) => {
            return (
              <div
                key={payment.id}
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  { "border-t": i !== 0 }
                )}
              >
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {payment.orderId}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {payment.status}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  $ {payment.amount.toLocaleString("es-AR")}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
