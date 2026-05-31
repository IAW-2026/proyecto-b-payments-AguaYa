import { prisma } from "@/app/lib/prisma";
import { Payment } from "@prisma/client";

const TAX_RATE = 0.21;

export async function createInvoice(payment: Payment): Promise<void> {
  const existing = await prisma.invoice.findUnique({
    where: { paymentId: payment.id },
  });
  //no queremos crear una factura si ya existe una para ese paymentId, por eso chequeamos antes de crearla.
  //Si ya existe, no hacemos nada.
  if (existing) return;

  const total = payment.amount;
  const subtotal = Math.round(total / (1 + TAX_RATE));
  const tax = total - subtotal;

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
