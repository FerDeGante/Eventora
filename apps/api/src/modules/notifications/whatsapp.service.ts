import { env } from "../../lib/env";

export const sendWhatsAppMessage = async (input: { to: string; message: string }) => {
  if (!env.WHATSAPP_API_URL || !env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_ID) {
    throw new Error("WhatsApp integration not configured");
  }

  const response = await fetch(`${env.WHATSAPP_API_URL}/${env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to,
      type: "text",
      text: { body: input.message },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  return response.json();
};
