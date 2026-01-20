import type { FastifyInstance } from "fastify";
import { mpPayment } from "../../lib/mercadopago";
import { handleMercadoPagoPayment } from "../../modules/payments/payment.service";

export async function mercadoPagoWebhookRoutes(app: FastifyInstance) {
  app.post("/mercadopago", async (request, reply) => {
    const queryParams = (request.query ?? {}) as Record<string, string>;
    const body = (request.body ?? {}) as Record<string, any>;
    const paymentId = queryParams["data.id"] || body?.data?.id || body?.id;

    if (!paymentId) {
      return reply.send({ acknowledged: true });
    }

    try {
      const payment = await mpPayment.get({ id: paymentId });
      await handleMercadoPagoPayment(payment);
    } catch (error: any) {
      request.log.error({ error }, "Error processing Mercado Pago webhook");
      return reply.status(500).send({ message: error.message });
    }

    return reply.send({ received: true });
  });
}
