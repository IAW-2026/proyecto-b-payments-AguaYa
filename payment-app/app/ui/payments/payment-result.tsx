import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { lusitana } from "@/app/ui/fonts";

type Variant = "success" | "failure" | "pending";

const CONFIG: Record<
  Variant,
  { Icon: typeof CheckCircleIcon; color: string; title: string; message: string }
> = {
  success: {
    Icon: CheckCircleIcon,
    color: "text-green-500",
    title: "Payment approved",
    message: "Your payment was processed successfully.",
  },
  failure: {
    Icon: XCircleIcon,
    color: "text-red-500",
    title: "Payment failed",
    message: "We couldn't process your payment. You can try again.",
  },
  pending: {
    Icon: ClockIcon,
    color: "text-yellow-500",
    title: "Payment pending",
    message: "Your payment is being processed. We'll update its status shortly.",
  },
};

// MercadoPago appends these query params to the back_urls after checkout.
type MpParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function PaymentResult({
  variant,
  params,
}: {
  variant: Variant;
  params: MpParams;
}) {
  const { Icon, color, title, message } = CONFIG[variant];

  const details = [
    { label: "Payment ID", value: first(params.payment_id) },
    { label: "Status", value: first(params.status) },
    { label: "Order (external reference)", value: first(params.external_reference) },
  ].filter((d) => d.value);

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <Icon className={`mx-auto mb-4 h-16 w-16 ${color}`} />
        <h1 className={`${lusitana.className} mb-2 text-2xl font-bold`}>{title}</h1>
        <p className="mb-6 text-sm text-gray-500">{message}</p>

        {details.length > 0 && (
          <dl className="mb-6 divide-y divide-gray-100 rounded-md border border-gray-100 text-left text-sm">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between gap-4 px-4 py-2">
                <dt className="text-gray-500">{d.label}</dt>
                <dd className="truncate font-mono text-gray-700">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <Link
          href="/buyer/payments"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Back to my payments
        </Link>
      </div>
    </main>
  );
}
