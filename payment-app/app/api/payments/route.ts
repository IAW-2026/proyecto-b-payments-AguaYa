import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { createMercadoPagoPreference } from "@/app/integrations/mercadopago/create-preference";

// la siguiente es la estructura esperada del header y body de la petición para crear un nuevo pago desde la app de buyer
/*
  Headers:
  'Content-Type': 'application/json'
    x-api-key: <INTERNAL_API_KEY>

  Body:
  {
    "orderId": String,
    "buyer": {
      "id": String,
      "name": String,
      "email": String,
      "address": String
    },
    "seller": {
      "id": String,
      "name": String
    },
    "amount": Number,
    "items": [
      {
        "id": String,
        "name": String,
        "imageUrl": String,
        "quantity": Number,
        "unitPrice": Number
      }
    ]
  }
*/
export async function POST(request: Request) {
  // Verificar API Key para seguridad del endpoint
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  //se verifica que el monto total del pago coincida con la suma de los subtotales de los items (cantidad * precio unitario) para evitar inconsistencias
  const itemsTotal = body.items.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + item.quantity * item.unitPrice,
    0,
  );
  if (itemsTotal !== body.amount) {
    return NextResponse.json(
      { error: "amount does not match sum of items" },
      { status: 400 },
    );
  }

  if (!body.buyer?.address || typeof body.buyer.address !== "string") {
    return NextResponse.json(
      { error: "buyer.address is required" },
      { status: 400 },
    );
  }

  // Crear el payment y guardarlo en la base de datos
  const payment = await prisma.payment.create({
    data: {
      orderId: body.orderId,
      //datos del buyer
      buyerId: body.buyer.id,
      buyerName: body.buyer.name,
      buyerEmail: body.buyer.email,
      buyerAddress: body.buyer.address,
      //datos del seller
      sellerId: body.seller.id,
      sellerName: body.seller.name,
      //monto total del pago
      amount: body.amount,
      //estado del pago (inicialmente pendiente)
      status: "pending",
      //items del pago (relación uno a muchos)
      items: {
        createMany: {
          data: body.items.map(
            (item: {
              id: string;
              name: string;
              imageUrl: string;
              quantity: number;
              unitPrice: number;
            }) => ({
              productId: item.id,
              productName: item.name,
              productImageUrl: item.imageUrl,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            }),
          ),
        },
      },
    },
  });

  try {
    const preference = await createMercadoPagoPreference({
      paymentId: payment.id,
      items: body.items,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { mpPreferenceId: preference.id },
    });

    return NextResponse.json({
      message: "payment created",
      paymentId: payment.id,
      preferenceId: preference.id,
      checkoutUrl: preference.sandbox_init_point,
    });
  } catch (error) {
    await prisma.payment.delete({ where: { id: payment.id } });
    return NextResponse.json(
      { error: "could not create payment preference" },
      { status: 500 },
    );
  }
}
