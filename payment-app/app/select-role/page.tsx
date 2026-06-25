import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = { title: "Seleccionar rol" };
import { redirect } from "next/navigation";
import {
  ShoppingBagIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { resolvePaymentUser } from "@/app/lib/data";
import { selectRole } from "./actions";

export default async function SelectRolePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const roles = clerkUser?.publicMetadata?.roles as string[] | undefined;
  if (roles?.includes("admin_payment") || roles?.includes("admin_payments")) {
    redirect("/admin/dashboard");
  }

  const profile = await resolvePaymentUser(userId);

  if (profile.status === "DELETED" || profile.status === "SUSPENDED") {
    redirect("/no-account");
  }

  //const hasBuyer  = roles?.includes("buyer")  ?? false;
  const hasBuyer = roles?.includes("buyer") ?? false;
  const hasSeller = roles?.includes("seller") ?? false;

  if (!hasBuyer && !hasSeller) redirect("/no-account");

  if (hasBuyer && !hasSeller) redirect("/api/auto-select-role?role=buyer");
  if (hasSeller && !hasBuyer) redirect("/api/auto-select-role?role=seller");

  const selectBuyer = selectRole.bind(null, "buyer");
  const selectSeller = selectRole.bind(null, "seller");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EBF5FA] dark:bg-[#0B1E2D]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0B1E2D] dark:text-[#E8EEF1] mb-2">
          ¿Cómo quieres usar AguaYa Pagos?
        </h1>
        <p className="text-[#1B4965] dark:text-[#7FB3CC] mb-10">
          Elige tu rol para continuar
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {hasBuyer && (
            <form action={selectBuyer}>
              <button
                type="submit"
                className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-[#7FB3CC] dark:border-[#1B4965] bg-white dark:bg-[#091929] p-8 shadow-sm hover:border-[#3DD6F0] hover:shadow-md transition-all cursor-pointer"
              >
                <ShoppingBagIcon className="w-12 h-12 text-[#3DD6F0]" />
                <span className="text-lg font-semibold text-[#0B1E2D] dark:text-[#E8EEF1]">
                  Comprador
                </span>
                <span className="text-sm text-[#1B4965] dark:text-[#7FB3CC]">
                  Realiza pagos y gestiona tus compras
                </span>
              </button>
            </form>
          )}

          {hasSeller && (
            <form action={selectSeller}>
              <button
                type="submit"
                className="flex flex-col items-center gap-4 w-52 rounded-2xl border-2 border-[#7FB3CC] dark:border-[#1B4965] bg-white dark:bg-[#091929] p-8 shadow-sm hover:border-[#3DD6F0] hover:shadow-md transition-all cursor-pointer"
              >
                <BuildingStorefrontIcon className="w-12 h-12 text-[#3DD6F0]" />
                <span className="text-lg font-semibold text-[#0B1E2D] dark:text-[#E8EEF1]">
                  Vendedor
                </span>
                <span className="text-sm text-[#1B4965] dark:text-[#7FB3CC]">
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
