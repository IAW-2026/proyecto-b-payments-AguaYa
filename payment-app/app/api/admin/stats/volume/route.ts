import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";
import {
  fetchVolumeStats,
  volumeDefaultFrom,
  type VolumePeriod,
} from "@/app/lib/data/payments";

const VALID_PERIODS = new Set<string>(["daily", "weekly", "monthly"]);

function parseDate(s: string | null): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function GET(request: NextRequest) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;

  const periodParam = searchParams.get("period") ?? "daily";
  const period: VolumePeriod = VALID_PERIODS.has(periodParam)
    ? (periodParam as VolumePeriod)
    : "daily";

  const fromDate = parseDate(searchParams.get("from")) ?? volumeDefaultFrom(period);
  const toRaw = parseDate(searchParams.get("to"));
  const toDate = toRaw
    ? new Date(toRaw.getFullYear(), toRaw.getMonth(), toRaw.getDate(), 23, 59, 59, 999)
    : new Date();

  const data = await fetchVolumeStats(period, fromDate, toDate);

  return NextResponse.json({ period, data });
}
