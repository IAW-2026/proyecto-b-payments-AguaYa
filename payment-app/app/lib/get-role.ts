import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function getRole(): Promise<"buyer" | "seller" | undefined> {
  const { sessionClaims } = await auth();
  const cookieStore = await cookies();
  return (
    sessionClaims?.public_metadata?.lastRole ??
    (cookieStore.get("lastRole")?.value as "buyer" | "seller" | undefined)
  );
}
