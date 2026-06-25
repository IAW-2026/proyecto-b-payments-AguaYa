import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { buildPDF } from "@/app/lib/invoices/build-pdf";
import { verifyControlPlaneToken } from "@/app/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyControlPlaneToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      subtotal: true,
      tax: true,
      total: true,
      issuedAt: true,
      payment: {
        select: {
          orderId: true,
          buyerName: true,
          buyerEmail: true,
          sellerName: true,
          items: {
            select: {
              productName: true,
              quantity: true,
              unitPrice: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: `No se encontró una factura con ID "${id}"` }, { status: 404 });
  }

  const buffer = await buildPDF(invoice);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="factura-${id}.pdf"`,
    },
  });
}
