import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import SideNavAdmin from "@/app/ui/admin/sidenav-admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | AguaYa Admin",
    default: "AguaYa Admin",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const roles = clerkUser?.publicMetadata?.roles as string[] | undefined;

  if (!roles?.includes("admin_payment")) {
    redirect("/select-role");
  }

  const name =
    clerkUser?.fullName ??
    clerkUser?.primaryEmailAddress?.emailAddress ??
    userId;

  await prisma.paymentAdmin.upsert({
    where: { userId },
    create: { userId, name },
    update: {},
  });

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white dark:bg-gray-950">
      <div className="w-full flex-none md:w-64">
        <SideNavAdmin />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 text-gray-900 dark:text-gray-100">
        {children}
      </div>
    </div>
  );
}
