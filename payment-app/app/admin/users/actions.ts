"use server";

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const clerkUser = await currentUser();
  const roles = clerkUser?.publicMetadata?.roles as string[] | undefined;
  if (!roles?.includes("admin_payment")) redirect("/sign-in");
  return userId;
}

async function findProfile(profileId: string) {
  if (!profileId || typeof profileId !== "string" || profileId.trim() === "") {
    throw new Error("ID de perfil inválido.");
  }
  const profile = await prisma.externalProfile.findUnique({
    where: { id: profileId },
  });
  if (!profile) throw new Error("Usuario no encontrado.");
  return profile;
}

export async function suspendUser(formData: FormData) {
  const adminId = await requireAdmin();
  const profileId = formData.get("profileId") as string;
  const profile = await findProfile(profileId);

  if (profile.clerkId === adminId) throw new Error("No podés suspender tu propio perfil.");
  if (profile.status !== "ACTIVE") throw new Error("Solo se pueden suspender perfiles activos.");

  const clerk = await clerkClient();
  try { await clerk.users.banUser(profile.clerkId); } catch {}

  await prisma.externalProfile.update({
    where: { id: profileId },
    data: { status: "SUSPENDED" },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function restoreUser(formData: FormData) {
  await requireAdmin();
  const profileId = formData.get("profileId") as string;
  const profile = await findProfile(profileId);

  if (profile.status !== "SUSPENDED") throw new Error("Solo se pueden restaurar perfiles suspendidos.");

  const clerk = await clerkClient();
  try { await clerk.users.unbanUser(profile.clerkId); } catch {}

  await prisma.externalProfile.update({
    where: { id: profileId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  const adminId = await requireAdmin();
  const profileId = formData.get("profileId") as string;
  const profile = await findProfile(profileId);

  if (profile.clerkId === adminId) throw new Error("No podés eliminar tu propio perfil.");
  if (profile.status === "DELETED") throw new Error("El perfil ya fue eliminado.");

  const clerk = await clerkClient();
  try { await clerk.users.deleteUser(profile.clerkId); } catch {}

  await prisma.externalProfile.update({
    where: { id: profileId },
    data: { status: "DELETED" },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
