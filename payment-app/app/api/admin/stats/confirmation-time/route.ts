import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";
import { fetchConfirmationTimeStats } from "@/app/lib/data/payments";

export async function GET(request: NextRequest) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await fetchConfirmationTimeStats();

  return NextResponse.json(data);
}
