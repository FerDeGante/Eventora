import type { FastifyInstance } from "fastify";
import { checkoutSessionInput, paymentQuerySchema, refundInputSchema } from "./payment.schema";
import { 
  createCheckoutSession, 
  createMercadoPagoPreference, 
  recordCashPayment, 
  recordTerminalPayment,
  listPayments,
  getPaymentById,
  refundPayment
} from "./payment.service";
import { requireRoles } from "../../utils/rbac";

const billingRolesGuard = requireRoles(["ADMIN", "MANAGER", "RECEPTION"]);

export async function paymentRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [app.authenticate, billingRolesGuard] },
    async (request, reply) => {
      const query = paymentQuerySchema.parse(request.query ?? {});
      try {
        const result = await listPayments(query);
        return reply.send(result);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    }
  );

  app.get(
    "/:id",
    { preHandler: [app.authenticate, billingRolesGuard] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const payment = await getPaymentById(id);
        return reply.send(payment);
      } catch (error: any) {
        return reply.code(404).send({ message: error.message });
      }
    }
  );

  app.post(
    "/:id/refund",
    { preHandler: [app.authenticate, billingRolesGuard] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = refundInputSchema.parse(request.body ?? {});
      try {
        const payment = await refundPayment(id, body);
        return reply.send(payment);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    }
  );

  app.post(
    "/checkout",
    { preHandler: [app.authenticate, billingRolesGuard] },
    async (request, reply) => {
      const body = checkoutSessionInput.parse(request.body);
      try {
        if (body.provider === "cash") {
          const payment = await recordCashPayment(body);
          return reply.send(payment);
        }
        if (body.provider === "terminal") {
          const payment = await recordTerminalPayment(body);
          return reply.send(payment);
        }
        const session = await createCheckoutSession(body);
        return reply.send({ sessionId: session.id, url: session.url });
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.post(
    "/mercadopago",
    { preHandler: [app.authenticate, billingRolesGuard] },
    async (request, reply) => {
      const body = checkoutSessionInput.parse(request.body);
      try {
        const preference = await createMercadoPagoPreference(body);
        return reply.send({ id: preference.id, init_point: preference.init_point, sandbox_init_point: preference.sandbox_init_point });
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );
}
