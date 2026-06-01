import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { paymentClient } from "@/app/integrations/mercadopago";
import { updatePaymentStatus } from "@/app/lib/payments/update-status";
import { createInvoice } from "@/app/lib/invoices/create-invoice";
import { notifyPaymentApproved } from "@/app/integrations/notify-payment";

// Recibe la notificación de Mercado Pago para actualizar el estado del payment en la base de datos.
// estructura del request que envía Mercado Pago al webhook:
//   { "type": "payment", "data": { "id": "<id del pago en MP>" } }
//
// Con ese id consultamos su API para obtener el detalle real del pago
// (status, external_reference, payment_method_id) y actualizamos el payment en la base de datos.
export async function POST(request: Request) {
  try {
    // 1. Verificar la firma de MercadoPago para asegurarnos que el request viene de mercadopago.
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const dataId = new URL(request.url).searchParams.get("data.id");

    const parts = xSignature?.split(",");
    const ts = parts?.find((p) => p.startsWith("ts="))?.split("=")[1];
    const v1 = parts?.find((p) => p.startsWith("v1="))?.split("=")[1];

    const signedTemplate = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const generatedHash = crypto
      .createHmac("sha256", process.env.MP_WEBHOOK_SECRET!)
      .update(signedTemplate)
      .digest("hex");

    if (generatedHash !== v1) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // 2. Filtrar: solo nos interesan las notificaciones de tipo "payment".
    if (body.type !== "payment" || !body.data?.id) {
      // Otros eventos los confirmamos con 200 para que MP no reintente.
      return NextResponse.json({ ignored: true });
    }

    // 3. Consultar a la API de Mercado Pago el detalle real del pago.
    const mpPayment = await paymentClient.get({ id: body.data.id });

    // external_reference es nuestro id de pago local (el payment.id que generamos).
    const externalReference = mpPayment.external_reference;
    if (!externalReference) {
      return NextResponse.json(
        { error: "Missing external_reference" },
        { status: 400 },
      );
    }

    // 4. Buscar el payment por su id (@unique).
    const payment = await prisma.payment.findUnique({
      where: { id: externalReference },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 5. Actualizar el estado del payment con el detalle confirmado por Mercado Pago.
    const { alreadyProcessed, newStatus } = await updatePaymentStatus(payment, mpPayment);

    // 6. Si el payment quedó aprobado, generamos la factura y notificamos a SellerApp y BuyerApp.
    if (!alreadyProcessed && newStatus === "approved") {
      await createInvoice(payment, mpPayment.date_approved ?? undefined);

      await notifyPaymentApproved({
        orderId: payment.orderId,
        transactionId: payment.id,
        amount: payment.amount,
        buyerId: payment.buyerId,
      });
    }

    return NextResponse.json({ success: true, alreadyProcessed });
  } catch (error) {
    console.error("❌ Error en el Webhook de Mercado Pago:", error);
    // 500 para que Mercado Pago reintente la notificación más tarde.
    return new Response("Internal Server Error", { status: 500 });
  }
}
