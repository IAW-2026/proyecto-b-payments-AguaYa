"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function selectRole(role: "buyer" | "seller") {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { ...user.publicMetadata, lastRole: role },
  });

  const cookieStore = await cookies();
  cookieStore.set("lastRole", role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}
