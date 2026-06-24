"use client";

import { useState } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useClerk } from "@clerk/nextjs";
import { clearSessionCookies } from "@/app/lib/auth-actions";

export default function ConfirmLogout({ triggerClassName }: { triggerClassName: string }) {
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();

  async function handleSignOut() {
    await clearSessionCookies();
    signOut({ redirectUrl: "/" });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <ArrowRightOnRectangleIcon className="w-6" />
        <span className="grow">Cerrar sesión</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg w-80 dark:border-gray-700 dark:bg-gray-900">
            <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
              Cerrar sesión
            </p>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro que querés salir?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-transparent dark:text-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
