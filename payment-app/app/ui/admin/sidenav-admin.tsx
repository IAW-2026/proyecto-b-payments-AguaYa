import Link from "next/link";
import NavLinksAdmin from "@/app/ui/admin/nav-links-admin";
import ConfirmLogout from "@/app/ui/shared/confirm-logout";

export default function SideNavAdmin() {

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        href="/admin/dashboard"
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-red-700 p-4 md:h-40"
      >
        <div>
          <p className="text-white text-xl font-semibold">AguaYa</p>
          <p className="text-red-200 text-xs font-medium">Admin</p>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinksAdmin />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-gray-800 md:block" />
        <ConfirmLogout triggerClassName="flex h-[48px] w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:bg-red-950" />
      </div>
    </div>
  );
}
