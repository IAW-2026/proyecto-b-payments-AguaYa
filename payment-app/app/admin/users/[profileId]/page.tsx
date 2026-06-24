import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = { title: "Perfil de usuario" };
import { lusitana } from "@/app/ui/fonts";
import { prisma } from "@/app/lib/prisma";
import { suspendUser, restoreUser, deleteUser } from "../actions";
import ConfirmPanel from "@/app/ui/admin/confirm-panel";
import { ProfileStatus } from "@prisma/client";
import clsx from "clsx";

type Props = {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ action?: string }>;
};

const STATUS_STYLES: Record<ProfileStatus, string> = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  DELETED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  SUSPENDED:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
};

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: Props) {
  const { profileId } = await params;
  const { action } = await searchParams;

  const user = await prisma.paymentUser.findUnique({
    where: { id: profileId },
  });
  if (!user) notFound();

  return (
    <main className="max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/users"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Volver
        </Link>
      </div>

      <h1
        className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}
      >
        Detalle de usuario
      </h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:divide-gray-700 mb-6">
        <Row label="# Perfil" value={String(user.profileNumber)} />
        <Row label="Buyer name" value={user.buyerName ?? "—"} />
        <Row label="Seller name" value={user.sellerName ?? "—"} />
        <Row label="Clerk ID" value={user.clerkId} mono />
        <Row label="Buyer ID" value={user.buyerId ?? "—"} mono />
        <Row label="Seller ID" value={user.sellerId ?? "—"} mono />
        <div className="flex justify-between px-6 py-4 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Estado</span>
          <span
            className={clsx(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              STATUS_STYLES[user.status],
            )}
          >
            {user.status}
          </span>
        </div>
        <Row
          label="Creado"
          value={user.createdAt.toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        />
      </div>

      {/* Botones de acción */}
      {user.status !== "DELETED" && !action && (
        <div className="flex flex-wrap gap-3">
          {user.status === "SUSPENDED" && (
            <Link
              href={`/admin/users/${profileId}?action=restore`}
              className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors dark:border-green-700 dark:bg-transparent dark:text-green-400"
            >
              Restaurar acceso
            </Link>
          )}
          {user.status === "ACTIVE" && (
            <Link
              href={`/admin/users/${profileId}?action=suspend`}
              className="rounded-lg border border-yellow-300 bg-white px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors dark:border-yellow-700 dark:bg-transparent dark:text-yellow-400"
            >
              Suspender
            </Link>
          )}
          <Link
            href={`/admin/users/${profileId}?action=delete`}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors dark:border-red-700 dark:bg-transparent dark:text-red-400"
          >
            Eliminar
          </Link>
        </div>
      )}

      {/* Panel confirmación: suspender */}
      {action === "suspend" && user.status === "ACTIVE" && (
        <ConfirmPanel
          title="¿Suspender este usuario?"
          description="El usuario no podrá iniciar sesión hasta que restaures su acceso. Esta acción es reversible."
          confirmLabel="Sí, suspender"
          confirmClass="bg-yellow-600 hover:bg-yellow-700 text-white"
          cancelHref={`/admin/users/${profileId}`}
          action={suspendUser}
          profileId={profileId}
        />
      )}

      {/* Panel confirmación: restaurar */}
      {action === "restore" && user.status === "SUSPENDED" && (
        <ConfirmPanel
          title="¿Restaurar acceso?"
          description="El usuario podrá iniciar sesión nuevamente."
          confirmLabel="Sí, restaurar"
          confirmClass="bg-green-600 hover:bg-green-700 text-white"
          cancelHref={`/admin/users/${profileId}`}
          action={restoreUser}
          profileId={profileId}
        />
      )}

      {/* Panel confirmación: eliminar */}
      {action === "delete" && user.status !== "DELETED" && (
        <ConfirmPanel
          title="¿Eliminar este usuario?"
          description="El usuario será eliminado permanentemente de la plataforma. Esta accion es irreversible."
          confirmLabel="Entiendo, eliminar permanentemente"
          confirmClass="bg-red-600 hover:bg-red-700 text-white"
          cancelHref={`/admin/users/${profileId}`}
          action={deleteUser}
          profileId={profileId}
          variant="danger"
        />
      )}
    </main>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between px-6 py-4 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={clsx(
          "text-gray-700 dark:text-gray-300",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}
