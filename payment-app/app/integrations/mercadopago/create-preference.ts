import { preferenceClient } from "@/app/integrations/mercadopago";

type PreferenceItem = {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
};

type CreatePreferenceInput = {
  paymentId: string;
  items: PreferenceItem[];
};

export async function createMercadoPagoPreference({
  paymentId,
  items,
}: CreatePreferenceInput) {
  const response = await preferenceClient.create({
    body: {
      items: items.map((item) => ({
        id: item.id,
        title: item.name,
        picture_url: item.imageUrl,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),

      external_reference: paymentId,

      notification_url: process.env.MP_WEBHOOK_URL,

      /*back_urls: {
        success: "http://localhost:3000/payments/success",
        failure: "http://localhost:3000/payments/failure",
        pending: "http://localhost:3000/payments/pending",
      },*/
    },
  });
  return response;
}
