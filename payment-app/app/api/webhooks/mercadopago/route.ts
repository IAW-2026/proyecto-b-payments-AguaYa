import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { paymentClient } from "@/app/lib/mercadopago/index";

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

    // 5. Idempotencia: Mercado Pago puede reenviar la misma notificación varias veces.
    //    Si el estado no cambió, respondemos 200 sin volver a escribir.
    if (payment.mpStatus === mpPayment.status) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // 6. Estados terminales: una vez que el payment llegó a un estado final no puede cambiar.
    const terminalStatuses: PaymentStatus[] = [
      "approved",
      "rejected",
      "cancelled",
      "expired",
    ];
    if (terminalStatuses.includes(payment.status)) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // 7. Actualizar el payment con el detalle confirmado por Mercado Pago.
    const newStatus = mapStatus(mpPayment.status);

    await prisma.payment.update({
      where: { id: externalReference },
      data: {
        mpPaymentId: mpPayment.id != null ? String(mpPayment.id) : undefined,
        mpStatus: mpPayment.status ?? undefined,
        mpPaymentMethod: mpPayment.payment_method_id ?? undefined,
        status: newStatus,
      },
    });

    console.log(
      `✅ Payment ${externalReference} actualizado a "${mpPayment.status}".`,
    );

    // 8. Si el payment quedó aprobado, generamos su factura (una sola por payment).
    if (newStatus === "approved") {
      const existingInvoice = await prisma.invoice.findUnique({
        where: { paymentId: payment.id },
      });

      if (!existingInvoice) {
        // TODO: el desglose real de subtotal e IVA debería obtenerse del detalle
        //       de pago de Mercado Pago (mpPayment). Por ahora guardamos el total
        //       sin discriminar impuestos.
        const total = payment.amount;
        const subtotal = total;
        const tax = 0;

        await prisma.invoice.create({
          data: {
            paymentId: payment.id,
            subtotal,
            tax,
            total,
          },
        });

        console.log(`🧾 Factura generada para el payment ${payment.id}.`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error en el Webhook de Mercado Pago:", error);
    // 500 para que Mercado Pago reintente la notificación más tarde.
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Traduce los estados de Mercado Pago a nuestro enum PaymentStatus.
function mapStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}
