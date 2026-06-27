import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10) || 1);
  const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10);

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        subtotal: true,
        tax: true,
        total: true,
        issuedAt: true,
        payment: {
          select: {
            id: true,
            orderId: true,
            buyerName: true,
            sellerName: true,
            status: true,
          },
        },
      },
    }),
    prisma.invoice.count(),
  ]);

  return NextResponse.json({
    items: invoices,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  });
}
