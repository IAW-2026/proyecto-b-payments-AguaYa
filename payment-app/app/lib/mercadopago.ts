//inicializar SDK
//exportar cliente/configuración
// // SDK de Mercado Pago
import { MercadoPagoConfig } from "mercadopago";
// Agrega credenciales
if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error("MP_ACCESS_TOKEN is not defined");
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});
