import Link from "next/link";
import NavLinksBuyer from "@/app/ui/buyer/nav-links-buyer";

export default function SideNavBuyer() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        href="/buyer/dashboard"
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
      >
        <p className="text-white text-xl font-semibold">AguaYa</p>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinksBuyer />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
      </div>
    </div>
  );
}
