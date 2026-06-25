import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";
import { fetchUserConversionStats } from "@/app/lib/data/payments";

export async function GET(request: NextRequest) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await fetchUserConversionStats();

  return NextResponse.json(data);
}
