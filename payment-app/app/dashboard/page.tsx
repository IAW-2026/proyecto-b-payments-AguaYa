import { lusitana } from "@/app/ui/fonts";
import { fetchLatestPayments } from "@/app/lib/data";
import LatestPayments from "@/app/ui/dashboard/latest-payments";
export default async function Page() {
  const latestPayments = await fetchLatestPayments();
  return (
    <main>
      <h1 className={`${lusitana.className} text-4xl font-bold`}>Dashboard</h1>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <LatestPayments latestPayments={latestPayments} />
      </div>
    </main>
  );
}
