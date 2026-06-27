import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";
import { fetchPaymentStats, fetchMonthlyRevenue } from "@/app/lib/data/payments";

export async function GET(request: NextRequest) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, monthlyRevenue] = await Promise.all([
    fetchPaymentStats(),
    fetchMonthlyRevenue(),
  ]);

  return NextResponse.json({ stats, monthlyRevenue });
}
