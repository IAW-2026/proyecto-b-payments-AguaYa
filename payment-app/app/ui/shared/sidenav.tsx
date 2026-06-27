"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Pagos",     href: "/payments",  icon: CreditCardIcon },
  { name: "Facturas",  href: "/invoices",  icon: DocumentTextIcon },
  { name: "Ajustes",   href: "/settings",  icon: Cog6ToothIcon },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r border-[#7FB3CC] dark:border-[#1B4965] bg-[#D6EEF8] dark:bg-[#091929]">
      <Link
        href="/dashboard"
        className="water-gradient-animate flex h-20 flex-col items-start justify-end p-5 md:h-40"
      >
        <p className="text-[#E8EEF1] text-xl font-bold tracking-tight">AguaYa</p>
        <p className="text-[#3DD6F0] text-xs font-semibold tracking-[0.2em] uppercase">Pagos</p>
      </Link>

      <div className="h-px bg-[#7FB3CC] dark:bg-[#1B4965]" />

      <nav className="flex flex-grow flex-row md:flex-col">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex h-[48px] grow items-center justify-center gap-3 px-5 text-sm font-medium transition-colors md:grow-0 md:justify-start border-l-2",
                isActive
                  ? "border-[#3DD6F0] bg-[#1B4965]/20 dark:bg-[#1B4965]/40 text-[#1B4965] dark:text-[#3DD6F0]"
                  : "border-transparent text-[#1B4965] dark:text-[#7FB3CC] hover:bg-[#1B4965]/10 dark:hover:bg-[#1B4965]/20 hover:text-[#0B1E2D] dark:hover:text-[#E8EEF1]",
              )}
            >
              <LinkIcon className="w-5 shrink-0" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
