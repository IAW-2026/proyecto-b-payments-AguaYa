"use client";

export default function BuyerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Algo salió mal
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {error.message || "No se pudieron cargar los datos. Intentá de nuevo."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
