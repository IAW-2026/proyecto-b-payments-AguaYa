import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let payment;
  try {
    payment = await prisma.payment.findUnique({
      where: { id },
      select: {
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
      },
    });
  } catch {
    return NextResponse.json(
      { error: `ID de pago inválido: "${id}"` },
      { status: 400 },
    );
  }

  if (!payment) {
    return NextResponse.json(
      { error: `No se encontró un pago con ID "${id}"` },
      { status: 404 },
    );
  }

  return NextResponse.json(payment);
}
