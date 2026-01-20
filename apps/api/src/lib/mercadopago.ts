import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { env } from "./env";

const mpClient = new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN });

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);
