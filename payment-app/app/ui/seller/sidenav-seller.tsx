import Link from "next/link";
import NavLinksSeller from "@/app/ui/seller/nav-links-seller";

export default function SideNavSeller() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        href="/seller/dashboard"
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
      >
        <p className="text-white text-xl font-semibold">AguaYa</p>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinksSeller />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-gray-800 md:block"></div>
      </div>
    </div>
  );
}
