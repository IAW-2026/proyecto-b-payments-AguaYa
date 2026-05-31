"use client";
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: HomeIcon },
  { name: "Payments", href: "/buyer/payments", icon: CreditCardIcon },
  { name: "Invoices", href: "/buyer/invoices", icon: DocumentTextIcon },
  { name: "Settings", href: "/buyer/settings", icon: Cog6ToothIcon },
];

export default function NavLinksBuyer() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400",
              {
                "bg-sky-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400": pathname === link.href,
              },
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
