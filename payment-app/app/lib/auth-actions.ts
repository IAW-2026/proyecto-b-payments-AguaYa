"use server";

import { cookies } from "next/headers";

export async function clearSessionCookies() {
  (await cookies()).delete("lastRole");
}
