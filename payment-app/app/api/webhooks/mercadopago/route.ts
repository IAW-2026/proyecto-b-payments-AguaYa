import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { paymentClient } from "@/app/lib/mercadopago/index";

// Recibe la notificación de Mercado Pago y actualiza el estado del pago local.
//
// Mercado Pago notifica con:
//   { "type": "payment", "data": { "id": "<id del pago en MP>" } }
//
// Con ese id consultamos su API para obtener el detalle real del pago
// (status, external_reference, payment_method_id) y actualizamos el pago local.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Filtrar: solo nos interesan las notificaciones de tipo "payment".
    if (body.type !== "payment" || !body.data?.id) {
      // Otros eventos los confirmamos con 200 para que MP no reintente.
      return NextResponse.json({ ignored: true });
    }

    // 2. Consultar a la API de Mercado Pago el detalle real del pago.
    const mpPayment = await paymentClient.get({ id: body.data.id });

    // external_reference es nuestro id de pago local (el payment.id que generamos).
    const externalReference = mpPayment.external_reference;
    if (!externalReference) {
      return NextResponse.json(
        { error: "Missing external_reference" },
        { status: 400 },
      );
    }

    // 3. Buscar el pago local por su id (@unique).
    const localPayment = await prisma.payment.findUnique({
      where: { id: externalReference },
    });

    if (!localPayment) {
      // No se encontró ningún pago local con ese id.
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 4. Idempotencia: Mercado Pago puede reenviar la misma notificación varias veces.
    //    Si el estado no cambió, respondemos 200 sin volver a escribir.
    if (localPayment.mpStatus === mpPayment.status) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // 5. Actualizar el pago local con el detalle confirmado por Mercado Pago.
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
      `✅ Pago local ${externalReference} actualizado a "${mpPayment.status}".`,
    );

    // 6. Si el pago quedó aprobado, generamos su factura (una sola por pago).
    if (newStatus === "approved") {
      const existingInvoice = await prisma.invoice.findUnique({
        where: { paymentId: localPayment.id },
      });

      if (!existingInvoice) {
        // TODO: el desglose real de subtotal e IVA debería obtenerse del detalle
        //       de pago de Mercado Pago (mpPayment). Por ahora guardamos el total
        //       sin discriminar impuestos.
        const total = localPayment.amount;
        const subtotal = total;
        const tax = 0;

        await prisma.invoice.create({
          data: {
            paymentId: localPayment.id,
            subtotal,
            tax,
            total,
          },
        });

        console.log(`🧾 Factura generada para el pago ${localPayment.id}.`);
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
