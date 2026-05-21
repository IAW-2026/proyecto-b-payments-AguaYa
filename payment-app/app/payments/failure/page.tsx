import PaymentResult from "@/app/ui/payments/payment-result";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return <PaymentResult variant="failure" params={params} />;
}
