"use client";

import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Payments",  href: "/admin/payments",  icon: CreditCardIcon },
  { name: "Invoices",  href: "/admin/invoices",  icon: DocumentTextIcon },
  { name: "Usuarios",  href: "/admin/users",      icon: UsersIcon },
];

export default function NavLinksAdmin() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            aria-label={link.name}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-3 px-5 text-sm font-medium transition-colors md:grow-0 md:justify-start border-l-2",
              pathname === link.href
                ? "border-[#3DD6F0] bg-[#1B4965]/20 dark:bg-[#1B4965]/40 text-[#1B4965] dark:text-[#3DD6F0]"
                : "border-transparent text-[#1B4965] dark:text-[#7FB3CC] hover:bg-[#1B4965]/10 dark:hover:bg-[#1B4965]/20 hover:text-[#0B1E2D] dark:hover:text-[#E8EEF1]",
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
