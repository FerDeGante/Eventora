import type { FastifyInstance } from "fastify";
import { sendEmailInput, notificationQuerySchema } from "./notification.schema";
import { sendTransactionalEmail, listNotifications } from "./notification.service";
import { processDueNotifications } from "./notificationScheduler.service";

export async function notificationRoutes(app: FastifyInstance) {
  app.get(
    "/",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const query = notificationQuerySchema.parse(request.query ?? {});
      try {
        const result = await listNotifications(query);
        return reply.send(result);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    }
  );

  app.post(
    "/email",
    async (request, reply) => {
      const body = sendEmailInput.parse(request.body);
      try {
        const result = await sendTransactionalEmail(body);
        return reply.send(result);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.post(
    "/process-due",
    { preHandler: [app.authenticate] },
    async () => {
      return processDueNotifications();
    },
  );
}
