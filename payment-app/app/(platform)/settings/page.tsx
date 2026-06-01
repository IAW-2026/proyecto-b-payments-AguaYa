import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getRole } from "@/app/lib/get-role";
import SettingsPanel from "@/app/ui/shared/settings-panel";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = await getRole();
  if (!role) redirect("/select-role");

  const profile = await prisma.externalProfile.findUnique({
    where: { clerkId: userId },
  });

  if (!profile) redirect("/select-role");

  return <SettingsPanel userName={profile.userName} profileNumber={profile.profileNumber} />;
}
