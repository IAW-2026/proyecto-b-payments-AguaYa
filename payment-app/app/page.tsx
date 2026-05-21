/*import { payments } from "@/app/lib/placeholder-data";
import { redirect } from "next/navigation";
import { createCheckout } from "./lib/payments";

export default function Home() {
  const payment = payments[0];
  async function add() {
    "use server";
    const url = await createCheckout(payment);
    if (!url || typeof url !== "string") {
      throw new Error("URL de checkout no válida");
    }
    redirect(url);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col gap-8">
        <div className="bg-blue-50 border-2 border-blue-500 p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-4 text-blue-900">
            Detalles del Pedido
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <span className="font-semibold">Orden:</span> {payment.order_id}
            </p>
            <p>
              <span className="font-semibold">Comprador:</span>{" "}
              {payment.buyer_id}
            </p>
            <p>
              <span className="font-semibold">Vendedor:</span>{" "}
              {payment.seller_id}
            </p>
            <p>
              <span className="font-semibold">Monto:</span> ${payment.amount}
            </p>
          </div>
        </div>
        <form action={add}>
          <button
            type="submit"
            className="px-8 py-4 text-xl font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-600 transition-colors self-center"
          >
            Pagar
          </button>
        </form>
      </div>
    </div>
  );
}
*/
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  redirect("/select-role");
}
