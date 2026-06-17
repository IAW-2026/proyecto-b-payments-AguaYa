import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = { title: "Seleccionar rol" };
import { redirect } from "next/navigation";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { resolveExternalProfile } from "@/app/lib/data";
import { selectRole } from "./actions";

export default async function SelectRolePage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const roles = clerkUser?.publicMetadata?.roles as string[] | undefined;
  if (roles?.includes("admin_payment")) {
    redirect("/admin/dashboard");
  }
  const name =
    clerkUser?.fullName ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    userId;

  const profile = await resolveExternalProfile(userId, name);

  if (profile.status === "DELETED" || profile.status === "SUSPENDED") {
    redirect("/no-account");
  }

  const hasBuyer = !!profile.buyerId;
  const hasSeller = !!profile.sellerId;

  if (!hasBuyer && !hasSeller) redirect("/no-account");

  if (hasBuyer && !hasSeller) await selectRole("buyer");
  if (hasSeller && !hasBuyer) await selectRole("seller");

  const selectBuyer = selectRole.bind(null, "buyer");
  const selectSeller = selectRole.bind(null, "seller");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¿Cómo quieres usar AguaYa Pagos?
        </h1>
        <p className="text-gray-500 mb-10">Elige tu rol para continuar</p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {hasBuyer && (
            <form action={selectBuyer}>
              <button
                type="submit"
                className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <ShoppingBagIcon className="w-12 h-12 text-blue-500" />
                <span className="text-lg font-semibold text-gray-800">
                  Comprador
                </span>
                <span className="text-sm text-gray-600">
                  Realiza pagos y gestiona tus compras
                </span>
              </button>
            </form>
          )}

          {hasSeller && (
            <form action={selectSeller}>
              <button
                type="submit"
                className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <BuildingStorefrontIcon className="w-12 h-12 text-blue-500" />
                <span className="text-lg font-semibold text-gray-800">
                  Vendedor
                </span>
                <span className="text-sm text-gray-600">
                  Gestiona cobros, clientes y reportes
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
