import PaymentResult from "@/app/ui/payments/payment-result";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return <PaymentResult variant="pending" params={params} />;
}
