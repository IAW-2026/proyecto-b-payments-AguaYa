import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";
import { fetchAllUsers, countAllUsers, PAGE_SIZE } from "@/app/lib/data";
import SearchInput from "@/app/ui/shared/search-input";
import Pagination from "@/app/ui/shared/pagination";
import Link from "next/link";
import clsx from "clsx";

type ProfileStatus = "ACTIVE" | "DELETED" | "SUSPENDED";

type SearchParams = Promise<{ query?: string; page?: string }>;

const STATUS_STYLES: Record<ProfileStatus, string> = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  DELETED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  SUSPENDED:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { sessionClaims } = await auth();
  if (!sessionClaims?.public_metadata?.roles?.includes("admin_payments")) redirect("/sign-in");

  const params = await searchParams;
  const query = params.query;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const [users, total] = await Promise.all([
    fetchAllUsers(query, page),
    countAllUsers(query),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main>
      <h1
        className={`${lusitana.className} mb-6 text-2xl font-bold md:text-3xl`}
      >
        Usuarios
      </h1>

      <Suspense>
        <SearchInput placeholder="Buscar por Clerk ID, Buyer ID o Seller ID..." />
      </Suspense>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No se encontraron usuarios.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Clerk ID</th>
                  <th className="px-4 py-3">Buyer ID</th>
                  <th className="px-4 py-3">Seller ID</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {user.profileNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {user.userName ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {user.clerkId}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {user.buyerId ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {user.sellerId ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          STATUS_STYLES[user.status],
                        )}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {user.createdAt.toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors dark:border-blue-800 dark:hover:bg-blue-950 dark:text-blue-400"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} searchParams={params} />
      </div>
    </main>
  );
}
