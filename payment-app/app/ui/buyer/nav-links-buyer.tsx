"use client";
import {
  HomeIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  DocumentTextIcon,
  WalletIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: HomeIcon },
  { name: "Purchases", href: "/buyer/purchases", icon: ShoppingBagIcon },
  { name: "Payments", href: "/buyer/payments", icon: CreditCardIcon },
  { name: "Invoices", href: "/buyer/invoices", icon: DocumentTextIcon },
  { name: "Payment Methods", href: "/buyer/payment-methods", icon: WalletIcon },
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
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
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
