import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { paymentClient } from "@/app/lib/mercadopago";

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

    // 3. Actualizar el pago local por su id (@unique). updateMany no lanza si no existe,
    //    así podemos distinguir el caso "pago no encontrado".
    const result = await prisma.payment.updateMany({
      where: { id: externalReference },
      data: {
        mpPaymentId: mpPayment.id != null ? String(mpPayment.id) : undefined,
        mpStatus: mpPayment.status ?? undefined,
        mpPaymentMethod: mpPayment.payment_method_id ?? undefined,
        status: mapStatus(mpPayment.status),
      },
    });

    if (result.count === 0) {
      // No se encontró ningún pago local con ese id.
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    console.log(
      `✅ Pago local ${externalReference} actualizado a "${mpPayment.status}".`,
    );
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
