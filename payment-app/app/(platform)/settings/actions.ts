"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { getRole } from "@/app/lib/get-role";

export async function updateUserName(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userName = (formData.get("userName") as string)?.trim();
  if (!userName) return;

  const role = await getRole();

  await prisma.paymentUser.update({
    where: { clerkId: userId },
    data: role === "buyer" ? { buyerName: userName } : { sellerName: userName },
  });

  revalidatePath("/settings");
}
