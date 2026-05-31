import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function href(p: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Página {page} de {totalPages}
      </p>
      <div className="flex gap-1">
        {prevDisabled ? (
          <span className="rounded p-1 text-gray-300 dark:text-gray-600">
            <ChevronLeftIcon className="w-5" />
          </span>
        ) : (
          <Link
            href={href(page - 1)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeftIcon className="w-5" />
          </Link>
        )}
        {nextDisabled ? (
          <span className="rounded p-1 text-gray-300 dark:text-gray-600">
            <ChevronRightIcon className="w-5" />
          </span>
        ) : (
          <Link
            href={href(page + 1)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRightIcon className="w-5" />
          </Link>
        )}
      </div>
    </div>
  );
}
