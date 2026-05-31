import SideNavBuyer from "@/app/ui/buyer/sidenav-buyer";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white dark:bg-gray-950">
      <div className="w-full flex-none md:w-64">
        <SideNavBuyer />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 text-gray-900 dark:text-gray-100">{children}</div>
    </div>
  );
}
