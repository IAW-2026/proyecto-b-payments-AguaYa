"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

export async function updateUserName(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userName = (formData.get("userName") as string)?.trim();
  if (!userName) return;

  await prisma.externalProfile.update({
    where: { clerkId: userId },
    data: { userName },
  });

  revalidatePath("/settings");
}
