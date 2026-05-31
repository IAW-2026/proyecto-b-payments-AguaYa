"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Pending",      value: "pending" },
  { label: "Approved",     value: "approved" },
  { label: "Rejected",     value: "rejected" },
  { label: "Cancelled",    value: "cancelled" },
  { label: "Expired",      value: "expired" },
];

export default function PaymentsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const hasFilters =
    searchParams.get("status") || searchParams.get("from") || searchParams.get("to");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          id="status-filter"
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="from-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          From
        </label>
        <input
          id="from-filter"
          type="date"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(e) => updateParam("from", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="to-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          To
        </label>
        <input
          id="to-filter"
          type="date"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(e) => updateParam("to", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:[color-scheme:dark]"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => router.replace(pathname)}
          className="self-end rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
