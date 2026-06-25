import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  if (role !== "buyer" && role !== "seller") redirect("/select-role");

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
