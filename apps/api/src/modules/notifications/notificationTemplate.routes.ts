import type { FastifyInstance } from "fastify";
import { updateTemplateInput } from "./notification.schema";
import {
  listNotificationTemplates,
  getNotificationTemplate,
  updateNotificationTemplate,
} from "./notificationTemplate.service";

// A3 FIX: Todos los endpoints de templates requieren autenticación
export async function notificationTemplateRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.authenticate] }, async () => {
    return listNotificationTemplates();
  });

  app.get("/:key", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { key } = request.params as { key: string };
    const template = await getNotificationTemplate(key);
    if (!template) {
      return reply.status(404).send({ message: "Template not found" });
    }
    return template;
  });

  app.put(
    "/:key",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { key } = request.params as { key: string };
      const body = updateTemplateInput.parse(request.body ?? {});
      try {
        const template = await updateNotificationTemplate(key, body);
        return template;
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.patch(
    "/:key",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { key } = request.params as { key: string };
      const body = updateTemplateInput.parse(request.body ?? {});
      try {
        const template = await updateNotificationTemplate(key, body);
        return template;
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );
}
