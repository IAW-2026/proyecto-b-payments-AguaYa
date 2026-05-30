import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("MP_ACCESS_TOKEN is not defined");
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
export const paymentClient = new Payment(mpClient);
export const preferenceClient = new Preference(mpClient);
