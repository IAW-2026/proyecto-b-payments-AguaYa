import { auth, clerkClient } from "@clerk/nextjs/server";
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

  // clerkClient uses the secret key (server-to-server) — always returns fresh data,
  // unlike currentUser() which can return null during Clerk's post-sign-in session setup.
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const roles = clerkUser.publicMetadata?.roles as string[] | undefined;

  if (!roles?.includes("admin_payment") && !roles?.includes("admin_payments")) {
    redirect("/select-role");
  }

  const name =
    clerkUser.fullName ??
    clerkUser.primaryEmailAddress?.emailAddress ??
    userId;

  await prisma.paymentAdmin.upsert({
    where: { userId },
    create: { userId, name },
    update: {},
  });

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-[#EBF5FA] dark:bg-[#0B1E2D]">
      <div className="w-full flex-none md:w-64">
        <SideNavAdmin />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 text-[#0B1E2D] dark:text-[#E8EEF1]">
        {children}
      </div>
    </div>
  );
}
