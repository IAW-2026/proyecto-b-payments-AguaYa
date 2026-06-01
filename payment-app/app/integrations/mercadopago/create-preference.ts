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

      // TODO: las back_urls deben apuntar a la buyer app.
      // Una vez integradas las apps, reemplazar BUYER_APP_URL
      // con la URL real de la buyer app.
      // back_urls: {
      //   success: `${process.env.BUYER_APP_URL}/payments/success`,
      //   failure: `${process.env.BUYER_APP_URL}/payments/failure`,
      //   pending: `${process.env.BUYER_APP_URL}/payments/pending`,
      // },
      // auto_return: "approved",
    },
  });
  return response;
}
