import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShoppingBagIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { resolveExternalProfile } from "@/app/lib/data";

export default async function SelectRolePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await resolveExternalProfile(userId);

  const hasBuyer  = !!profile.buyerId;
  const hasSeller = !!profile.sellerId;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¿Cómo quieres usar AguaYa?
        </h1>
        <p className="text-gray-500 mb-10">Elige tu rol para continuar</p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Buyer Portal */}
          {hasBuyer ? (
            <Link
              href="/buyer/dashboard"
              className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
            >
              <ShoppingBagIcon className="w-12 h-12 text-blue-500" />
              <span className="text-lg font-semibold text-gray-800">Comprador</span>
              <span className="text-sm text-gray-400">Realiza pagos y gestiona tus compras</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm opacity-50 cursor-not-allowed">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
              <span className="text-lg font-semibold text-gray-500">Comprador</span>
              <span className="text-sm text-gray-400">No tenés acceso como comprador</span>
            </div>
          )}

          {/* Seller Portal */}
          {hasSeller ? (
            <Link
              href="/seller/dashboard"
              className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
            >
              <BuildingStorefrontIcon className="w-12 h-12 text-blue-500" />
              <span className="text-lg font-semibold text-gray-800">Vendedor</span>
              <span className="text-sm text-gray-400">Gestiona cobros, clientes y reportes</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm opacity-50 cursor-not-allowed">
              <BuildingStorefrontIcon className="w-12 h-12 text-gray-400" />
              <span className="text-lg font-semibold text-gray-500">Vendedor</span>
              <span className="text-sm text-gray-400">No tenés acceso como vendedor</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
