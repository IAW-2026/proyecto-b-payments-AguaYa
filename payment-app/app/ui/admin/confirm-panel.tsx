import Link from "next/link";

type Props = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  cancelHref: string;
  action: (formData: FormData) => Promise<void>;
  profileId: string;
  variant?: "default" | "danger";
};

export default function ConfirmPanel({
  title,
  description,
  confirmLabel,
  confirmClass,
  cancelHref,
  action,
  profileId,
  variant = "default",
}: Props) {
  const isDanger = variant === "danger";

  return (
    <div
      className={
        isDanger
          ? "rounded-xl border border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30"
          : "rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
      }
    >
      <p
        className={`mb-1 font-semibold ${
          isDanger
            ? "text-red-800 dark:text-red-300"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {title}
      </p>
      <p
        className={`mb-1 text-sm ${
          isDanger
            ? "text-red-700 dark:text-red-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {description}
      </p>

      {isDanger && (
        <p className="mb-4 text-sm font-semibold text-red-800 dark:text-red-300">
          ⚠ Esta acción es irreversible y no puede deshacerse.
        </p>
      )}

      {!isDanger && <div className="mb-4" />}

      <div className="flex gap-3">
        <form action={action}>
          <input type="hidden" name="profileId" value={profileId} />
          <button
            type="submit"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </form>
        <Link
          href={cancelHref}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-transparent dark:text-gray-300"
        >
          Cancelar
        </Link>
      </div>
    </div>
  );
}
