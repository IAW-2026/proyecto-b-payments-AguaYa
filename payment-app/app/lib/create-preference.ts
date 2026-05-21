import { preferenceClient } from "@/app/lib/mercadopago";

type CreatePreferenceInput = {
  paymentId: string;
  orderId: string;
  amount: number;
};

export async function createMercadoPagoPreference({
  paymentId,
  orderId,
  amount,
}: CreatePreferenceInput) {
  const response = await preferenceClient.create({
    body: {
      // TODO:
      // In the future, items should come from the cart/order itself.
      // Example:
      //
      // items: [
      //   {
      //     id: "product_1",
      //     title: "Keyboard",
      //     quantity: 1,
      //     unit_price: 15000,
      //   },
      //   {
      //     id: "product_2",
      //     title: "Mouse",
      //     quantity: 2,
      //     unit_price: 5000,
      //   },
      // ]
      //
      // For now, the entire order is represented as a single item.

      items: [
        {
          id: orderId,
          title: `Payment for order ${orderId}`,
          quantity: 1,
          unit_price: amount,
        },
      ],

      external_reference: paymentId,

      notification_url: "http://localhost:3000/api/webhooks/mercadopago",

      /*back_urls: {
        //  success: "http://localhost:3000/payments/success",
        //  failure: "http://localhost:3000/payments/failure",
        //  pending: "http://localhost:3000/payments/pending",
      },*/
    },
  });
  return response;
}
