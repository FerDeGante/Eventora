import type { FastifyInstance } from "fastify";
import { availabilityQuery, createTemplateInput, templateQuerySchema, updateTemplateInput } from "./availability.schema";
import { 
  createAvailabilityTemplate, 
  getAvailability,
  listTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate
} from "./availability.service";

export async function availabilityRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const query = availabilityQuery.parse(request.query ?? {});
    try {
      const slots = await getAvailability(query);
      return slots;
    } catch (error: any) {
      return reply.code(400).send({ message: error.message });
    }
  });

  app.get(
    "/templates",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const query = templateQuerySchema.parse(request.query ?? {});
      try {
        const templates = await listTemplates(query);
        return templates;
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    }
  );

  app.get(
    "/templates/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const template = await getTemplateById(id);
        return template;
      } catch (error: any) {
        return reply.code(404).send({ message: error.message });
      }
    }
  );

  app.post(
    "/templates",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = createTemplateInput.parse(request.body);
      try {
        const template = await createAvailabilityTemplate(body);
        return reply.code(201).send(template);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.patch(
    "/templates/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateTemplateInput.parse(request.body);
      try {
        const template = await updateTemplate(id, body);
        return template;
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.delete(
    "/templates/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        await deleteTemplate(id);
        return reply.code(204).send();
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );
}
