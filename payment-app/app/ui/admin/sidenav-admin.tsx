import Link from "next/link";
import NavLinksAdmin from "@/app/ui/admin/nav-links-admin";
import ConfirmLogout from "@/app/ui/shared/confirm-logout";
import ThemeToggle from "@/app/ui/admin/theme-toggle";

export default function SideNavAdmin() {
  return (
    <div className="flex h-full flex-col border-r border-[#7FB3CC] dark:border-[#1B4965] bg-[#D6EEF8] dark:bg-[#091929]">
      <Link
        href="/admin/dashboard"
        className="water-gradient-animate flex h-20 flex-col items-start justify-end p-5 md:h-40"
      >
        <p className="text-[#E8EEF1] text-xl font-bold tracking-tight">AguaYa</p>
        <p className="text-[#D4AF37] text-xs font-semibold tracking-[0.2em] uppercase">Administrador</p>
      </Link>

      <div className="h-px bg-[#7FB3CC] dark:bg-[#1B4965]" />

      <nav className="flex flex-grow flex-row md:flex-col">
        <NavLinksAdmin />
      </nav>

      <div className="h-px bg-[#7FB3CC] dark:bg-[#1B4965]" />

      <div className="flex flex-col gap-1 p-2">
        <ThemeToggle />
        <ConfirmLogout triggerClassName="flex h-[48px] w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300" />
      </div>
    </div>
  );
}
