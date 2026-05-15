import { lusitana } from "@/app/ui/fonts";
import { prisma } from "@/app/lib/prisma";
import { fetchLatestPayments } from "@/app/lib/data";
import LatestPayments from "@/app/ui/dashboard/latest-payments";
export default async function Page() {
  const payments = await prisma.payment.findMany();
  const latestPayments = await fetchLatestPayments();
  console.log(payments);
  return (
    <main>
      <h1 className={`${lusitana.className} text-4xl font-bold`}>Dashboard</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <LatestPayments latestPayments={latestPayments} />
      </div>
    </main>
  );
}
