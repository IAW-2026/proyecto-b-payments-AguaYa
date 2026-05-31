import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }
  //se espera un query param orderId para buscar la factura asociada a ese orderId
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId },
    include: { invoice: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!payment.invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const { invoice } = payment;

  return NextResponse.json({
    orderId: payment.orderId,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    issuedAt: invoice.issuedAt,
  });
}
