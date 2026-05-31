"use client";
import {
  ArrowRightOnRectangleIcon,
  ArrowsRightLeftIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { useClerk } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

export default function SettingsPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const role = pathname.split("/")[1]; // "buyer" | "seller"

  const switchTarget = role === "seller"
    ? { href: "/buyer/dashboard", label: "Cambiar a comprador", Icon: ShoppingBagIcon }
    : { href: "/seller/dashboard", label: "Cambiar a vendedor", Icon: BuildingStorefrontIcon };

  return (
    <div className="max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Configuración</h1>
      <p className="mb-8 text-sm text-gray-500">
        Estás usando AguaYa como{" "}
        <span className="font-medium text-gray-700">
          {role === "seller" ? "vendedor" : "comprador"}
        </span>
        .
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push(switchTarget.href)}
          className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          <switchTarget.Icon className="w-6" />
          <span className="grow">{switchTarget.label}</span>
          <ArrowsRightLeftIcon className="w-5 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left text-sm font-medium text-red-600 hover:border-red-500 hover:bg-red-50 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-6" />
          <span className="grow">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
