import { Preference } from "mercadopago";
import { mpClient } from "./mercadopago";
import { Payment } from "./definitions";

export async function createCheckout(payment: Payment) {
  const preference = new Preference(mpClient);

  const response = await preference.create({
    body: {
      items: [
        {
          id: payment.payment_id,
          title: `Order ${payment.order_id}`,
          quantity: 1,
          unit_price: payment.amount,
        },
      ],

      external_reference: payment.payment_id,

      notification_url: "https://localhost:3000/api/webhooks/mercadopago",

      back_urls: {
        success: "https://localhost:3000/payments/success",
        failure: "https://localhost:3000/payments/failure",
        pending: "https://localhost:3000/payments/pending",
      },
    },
  });

  return response.init_point; //id de la preferencia creada.
}
