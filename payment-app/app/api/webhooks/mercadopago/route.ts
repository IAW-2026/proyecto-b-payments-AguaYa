import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { paymentClient, mpClient } from "@/app/integrations/mercadopago";
import { MerchantOrder } from "mercadopago";
import { updatePaymentStatus } from "@/app/lib/payments/update-status";
import { createInvoice } from "@/app/lib/invoices/create-invoice";
import { notifyPaymentApproved } from "@/app/integrations/notify-payment";

// Resuelve el ID de pago de MP desde cualquiera de los formatos de notificación posibles:
//   - ?type=payment&data.id=<id>   (webhook desde el dashboard de MP)
//   - ?topic=payment&id=<id>       (IPN directo de pago)
//   - ?topic=merchant_order&id=<id>(IPN de orden mercantil)
//   - body JSON { type: "payment", data: { id } } (webhook formato cuerpo)
async function getMpPaymentId(request: Request): Promise<string | null> {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const typeParam = url.searchParams.get("type");
  const dataId = url.searchParams.get("data.id");
  const id = url.searchParams.get("id");

  // Formato: ?type=payment&data.id=<payment_id>
  if (typeParam === "payment" && dataId) {
    return dataId;
  }

  // Formato IPN: ?topic=payment&id=<payment_id>
  if (topic === "payment" && id) {
    return id;
  }

  // Formato IPN: ?topic=merchant_order&id=<merchant_order_id>
  if (topic === "merchant_order" && id) {
    const merchantOrderClient = new MerchantOrder(mpClient);
    const order = await merchantOrderClient.get({
      merchantOrderId: Number(id),
    });

    console.log("📦 MerchantOrder:", {
      id: order.id,
      status: order.order_status,
      payments: order.payments?.map((p) => ({ id: p.id, status: p.status })),
    });

    // En sandbox, las tarjetas de prueba a veces envían merchant_order con payments[]
    // vacío (notificación de "checkout abierto") sin una notificación de pago posterior.
    // En producción esto no ocurre — el pago siempre genera su propia notificación.
    const approvedPayment = order.payments?.find((p) => p.status === "approved");
    const payment = approvedPayment ?? order.payments?.[0];
    return payment?.id?.toString() ?? null;
  }

  // Formato body JSON (webhooks configurados en el dashboard de MP)
  try {
    const body = await request.json();
    console.log("🔔 Webhook MP body:", {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
    });
    if (body.type === "payment" && body.data?.id) {
      return body.data.id.toString();
    }
  } catch {
    // body vacío o no es JSON
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const mpPaymentId = await getMpPaymentId(request);

    console.log("🔔 Webhook MP recibido, mpPaymentId:", mpPaymentId);

    if (!mpPaymentId) {
      return NextResponse.json({ ignored: true });
    }

    const mpPayment = await paymentClient.get({ id: mpPaymentId });

    console.log("💳 MP Payment:", {
      id: mpPayment.id,
      status: mpPayment.status,
      externalReference: mpPayment.external_reference,
    });

    const externalReference = mpPayment.external_reference;
    if (!externalReference) {
      return NextResponse.json(
        { error: "Missing external_reference" },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: externalReference },
      include: { items: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const { alreadyProcessed, newStatus } = await updatePaymentStatus(
      payment,
      mpPayment,
    );

    console.log("📊 updatePaymentStatus:", { alreadyProcessed, newStatus, prevStatus: payment.status, prevMpStatus: payment.mpStatus });

    if (!alreadyProcessed && newStatus === "approved") {
      try {
        await createInvoice(payment, mpPayment.date_approved ?? undefined);
      } catch (err: any) {
        if (err?.code !== "P2002") throw err;
        // Factura ya creada por un request concurrente — continuar sin notificar
        return NextResponse.json({ success: true, alreadyProcessed: true });
      }
      await notifyPaymentApproved({
        orderId: payment.orderId,
        amount: payment.amount,
        buyerId: payment.buyerId,
        buyerName: payment.buyerName,
        sellerId: payment.sellerId,
        buyerAddress: payment.buyerAddress ?? "",
        items: payment.items.map((item) => ({
          productId: item.productId ?? "",
          quantity: item.quantity,
        })),
      });
    }

    return NextResponse.json({ success: true, alreadyProcessed });
  } catch (error) {
    console.error("❌ Error en el Webhook de Mercado Pago:", error);
    // 500 para que Mercado Pago reintente la notificación más tarde.
    return new Response("Internal Server Error", { status: 500 });
  }
}
