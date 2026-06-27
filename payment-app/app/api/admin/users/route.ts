import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { ProfileStatus } from "@prisma/client";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";

const VALID_STATUSES = new Set<string>(Object.values(ProfileStatus));

export async function GET(request: NextRequest) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1);
  const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
  const statusParam = searchParams.get("status") ?? undefined;
  const status =
    statusParam && VALID_STATUSES.has(statusParam)
      ? (statusParam as ProfileStatus)
      : undefined;
  const q = searchParams.get("q") ?? undefined;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { clerkId:    { contains: q, mode: "insensitive" as const } },
            { buyerName:  { contains: q, mode: "insensitive" as const } },
            { sellerName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.paymentUser.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        clerkId: true,
        buyerId: true,
        buyerName: true,
        sellerId: true,
        sellerName: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.paymentUser.count({ where }),
  ]);

  return NextResponse.json({
    items: users,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  });
}
