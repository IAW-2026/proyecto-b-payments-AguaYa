"use client";

import { useState } from "react";
import {
  ArrowsRightLeftIcon,
  ClipboardDocumentIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import ConfirmLogout from "@/app/ui/shared/confirm-logout";
import { useTheme } from "next-themes";
import { updateUserName } from "@/app/(platform)/settings/actions";

const ROLE_LABEL: Record<"buyer" | "seller", string> = {
  buyer: "Comprador",
  seller: "Vendedor",
};

export default function SettingsPanel({
  userName,
  profileNumber,
  otherRole,
  switchRoleAction,
}: {
  userName: string | null;
  profileNumber: number;
  otherRole: "buyer" | "seller" | null;
  switchRoleAction: ((formData: FormData) => Promise<void>) | null;
}) {
  const [confirming, setConfirming] = useState(false);

  const { theme, setTheme } = useTheme();

  function copyId() {
    navigator.clipboard.writeText(String(profileNumber));
  }

  return (
    <div className="max-w-md space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Configuración
      </h1>

      {/* Perfil */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Perfil
        </h2>

        <form action={updateUserName} className="flex gap-2">
          <input
            name="userName"
            defaultValue={userName ?? ""}
            placeholder="Nombre de usuario"
            className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </form>

        <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID público
            </p>
            <p className="mt-0.5 font-mono text-sm text-gray-700 dark:text-gray-300">
              #{profileNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={copyId}
            title="Copiar ID"
            aria-label="Copiar ID"
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            <ClipboardDocumentIcon className="w-5" />
          </button>
        </div>
      </section>

      {/* Acciones */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Cuenta
        </h2>

        {otherRole && switchRoleAction && (
          confirming ? (
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">
                ¿Cambiar a <span className="font-semibold">{ROLE_LABEL[otherRole]}</span>?
              </p>
              <div className="flex gap-2">
                <form action={switchRoleAction} className="flex-1">
                  <button
                    type="submit"
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Sí, cambiar
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex w-full items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <ArrowsRightLeftIcon className="w-6" />
              <span className="grow">Cambiar a {ROLE_LABEL[otherRole]}</span>
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-400"
        >
          {theme === "dark" ? (
            <SunIcon className="w-6" />
          ) : (
            <MoonIcon className="w-6" />
          )}
          <span className="grow">
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </span>
        </button>

        <ConfirmLogout triggerClassName="flex w-full items-center gap-3 rounded-md border border-red-600 bg-red-600 p-4 text-left text-sm font-medium text-white hover:border-red-700 hover:bg-red-700 transition-colors dark:border-red-500 dark:bg-red-600 dark:text-white dark:hover:bg-red-700" />
      </section>
    </div>
  );
}
