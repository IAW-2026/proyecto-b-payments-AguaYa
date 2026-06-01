"use client";

import {
  ArrowRightOnRectangleIcon,
  ArrowsRightLeftIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

const switchTarget = {
  buyer:  { href: "/select-role", label: "Cambiar a vendedor",  Icon: BuildingStorefrontIcon },
  seller: { href: "/select-role", label: "Cambiar a comprador", Icon: ShoppingBagIcon },
};

export default function SettingsPanel({ role }: { role: "buyer" | "seller" }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  const sw = switchTarget[role];

  return (
    <div className="max-w-md">
      <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        Estás usando AguaYa como{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {role === "seller" ? "vendedor" : "comprador"}
        </span>
        .
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push(sw.href)}
          className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
        >
          <sw.Icon className="w-6" />
          <span className="grow">{sw.label}</span>
          <ArrowsRightLeftIcon className="w-5 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-400"
        >
          {theme === "dark" ? <SunIcon className="w-6" /> : <MoonIcon className="w-6" />}
          <span className="grow">{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
        </button>

        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left text-sm font-medium text-red-600 hover:border-red-500 hover:bg-red-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-red-950"
        >
          <ArrowRightOnRectangleIcon className="w-6" />
          <span className="grow">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
