import { prisma } from "@/app/lib/prisma";
import { Payment } from "@prisma/client";

/*Implementacion a futuro:
Lo que haría falta para el IVA "real":

Saber la condición fiscal del vendedor (responsable inscripto, monotributista, etc.)
Integrar con AFIP (facturación electrónica), que es un sistema completamente separado de Mercado Pago y 
no tiene nada que ver con los pagos, pero es obligatorio para emitir facturas legales en Argentina. 
Esto es un proceso complejo que implica registrarse como emisor electrónico, obtener certificados digitales, 
y usar la API de AFIP para generar facturas electrónicas.

Por ahora, lo que hacemos es una factura "simulada" que se guarda en nuestra base de datos y se puede mostrar al cliente,
pero no es una factura legalmente válida. Calculamos el IVA como un porcentaje fijo del total que es lo normal en Argentina, sin importar la condición fiscal del vendedor,y no integramos con AFIP. 
 
*/
const TAX_RATE = 0.21;
//utliza la fecha de aporbacion de mercadopago para emitir la factura, si no esta disponible utiliza la
//  fecha actual. Esto es importante porque el cliente necesita la factura con la fecha de
//  aprobacion del pago, no con la fecha de creacion del payment que puede ser anterior.
export async function createInvoice(
  payment: Payment,
  approvedAt?: string,
): Promise<void> {
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
      issuedAt: approvedAt ? new Date(approvedAt) : new Date(),
    },
  });

  console.log(`🧾 Factura generada para el payment ${payment.id}.`);
}
