import { redirect } from "next/navigation";
import { getRole } from "@/app/lib/get-role";
import SideNav from "@/app/ui/shared/sidenav";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();
  if (!role) redirect("/select-role");

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-[#EBF5FA] dark:bg-[#0B1E2D]">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <main
        aria-label="Contenido principal"
        className="flex-grow p-6 md:overflow-y-auto md:p-12 text-[#0B1E2D] dark:text-[#E8EEF1]"
      >
        {children}
      </main>
    </div>
  );
}
