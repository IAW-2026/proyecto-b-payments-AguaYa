import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getRole } from "@/app/lib/get-role";
import SettingsPanel from "@/app/ui/shared/settings-panel";
import { selectRole } from "@/app/select-role/actions";

export const metadata: Metadata = {
  title: "Configuración | AguaYa Pagos",
  description:
    "Gestiona tu perfil, tu cuenta y las opciones de la aplicación en AguaYa Pagos.",
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = await getRole();
  if (!role) redirect("/select-role");

  const clerkUser = await currentUser();
  const roles = clerkUser?.publicMetadata?.roles as string[] | undefined;
  const hasBuyer  = roles?.includes("buyer")  ?? false;
  const hasSeller = roles?.includes("seller") ?? false;
  const otherRole = (hasBuyer && hasSeller)
    ? (role === "buyer" ? "seller" as const : "buyer" as const)
    : null;

  const profile = await prisma.paymentUser.findUnique({
    where: { clerkId: userId },
  });

  if (!profile) redirect("/select-role");

  const switchRoleAction = otherRole ? selectRole.bind(null, otherRole) : null;

  return (
    <SettingsPanel
      userName={role === "buyer" ? profile.buyerName : profile.sellerName}
      profileNumber={profile.profileNumber}
      otherRole={otherRole}
      switchRoleAction={switchRoleAction}
    />
  );
}
