import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createMercadoPagoPreference } from "@/app/lib/create-preference";

// Creates a local payment and its MercadoPago preference
export async function POST(request: Request) {
  const body = await request.json();

  // Create local payment
  const payment = await prisma.payment.create({
    data: {
      orderId: body.orderId,
      buyerId: body.buyerId,
      sellerId: body.sellerId,
      amount: body.amount,
      status: "pending",
    },
  });

  // Create MercadoPago preference
  const preference = await createMercadoPagoPreference({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: payment.amount,
  });

  // Store MercadoPago preference ID
  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      mpPreferenceId: preference.id,
    },
  });

  return NextResponse.json({
    message: "payment created",
    paymentId: payment.id,
    preferenceId: preference.id,
    checkoutUrl: preference.init_point,
  });
}
