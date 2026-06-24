import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";

const VALID_STATUSES = new Set<string>(Object.values(PaymentStatus));

const PAYMENT_SELECT = {
  id: true,
  orderId: true,
  buyerName: true,
  buyerEmail: true,
  buyerAddress: true,
  sellerName: true,
  amount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      productName: true,
      productImageUrl: true,
      quantity: true,
      unitPrice: true,
      subtotal: true,
    },
  },
} as const;

export async function GET(request: NextRequest) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10);
  const q = searchParams.get("q") ?? undefined;
  const statusParam = searchParams.get("status") ?? undefined;
  const status =
    statusParam && VALID_STATUSES.has(statusParam)
      ? (statusParam as PaymentStatus)
      : undefined;

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderId: { contains: q, mode: "insensitive" as const } },
            { buyerName: { contains: q, mode: "insensitive" as const } },
            { sellerName: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: PAYMENT_SELECT,
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({
    items: payments,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  });
}
