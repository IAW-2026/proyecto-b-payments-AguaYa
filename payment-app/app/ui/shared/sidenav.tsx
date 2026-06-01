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
  { name: "Payments",  href: "/payments",  icon: CreditCardIcon },
  { name: "Invoices",  href: "/invoices",  icon: DocumentTextIcon },
  { name: "Settings",  href: "/settings",  icon: Cog6ToothIcon },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        href="/dashboard"
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
      >
        <p className="text-white text-xl font-semibold">AguaYa</p>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400",
                {
                  "bg-sky-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400":
                    pathname === link.href,
                },
              )}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-gray-800 md:block" />
      </div>
    </div>
  );
}
