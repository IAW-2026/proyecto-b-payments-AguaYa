import { mpClient } from "@/app/lib/mercadopago";
import { Payment } from "mercadopago";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. FILTRAR: Asegurarnos de que Mercado Pago nos está avisando por un PAGO
    // Mercado Pago envía "action": "payment.created" o "payment.updated"
    if (body.action?.startsWith("payment") && body.data?.id) {
      const paymentClient = new Payment(mpClient);

      // Consultamos a la API de Mercado Pago los detalles del pago
      const payment = await paymentClient.get({ id: body.data.id });

      // 2. BUSCAR Y ACTUALIZAR: Buscamos tu orden local mediante el preference_id
      await prisma.payment.update({
        where: {
          // Usamos el ID de preferencia que vincula tu orden local con el pago de MP
          mpPreferenceId: payment.preference_id,
        },
        data: {
          mpPaymentId: payment.id?.toString(), // Ahora sí guardamos el ID real del pago
          mpStatus: payment.status,
          mpPaymentMethod: payment.payment_method_id,
          mpPaymentDate: payment.date_approved
            ? new Date(payment.date_approved)
            : null,
          status: mapStatus(payment.status), // Tu función de mapeo
          updatedAt: new Date(),
        },
      });

      console.log(`✅ Pago de MP ${body.data.id} procesado con éxito.`);
    }

    // 3. RESPUESTA OBLIGATORIA: Siempre devolvemos 200 a MP, incluso si el evento no era un pago
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error en el Webhook de Mercado Pago:", error);

    // Devolvemos 500 solo si algo falló internamente para que Mercado Pago intente reenviarlo más tarde
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Asegúrate de tener tu función mapStatus armada para transformar los estados de MP (approved, pending, rejected) a los tuyos locales.
function mapStatus(mpStatus: string | undefined): string {
  if (mpStatus === "approved") return "approved";
  if (mpStatus === "rejected") return "rejected";
  if (mpStatus === "cancelled") return "cancelled";
  return "pending";
}
