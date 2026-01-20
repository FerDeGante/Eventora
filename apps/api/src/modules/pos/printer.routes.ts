import type { FastifyInstance } from "fastify";
import { printerCreateInput, printerUpdateInput } from "./printer.schema";
import { listPrinters, createPrinter, updatePrinter, deletePrinter } from "./printer.service";

export async function posPrinterRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.authenticate] }, async () => listPrinters());

  app.post(
    "/",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = printerCreateInput.parse(request.body);
      try {
        const printer = await createPrinter(body);
        return reply.code(201).send(printer);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.patch(
    "/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = printerUpdateInput.parse(request.body ?? {});
      try {
        const printer = await updatePrinter(id, body);
        return reply.send(printer);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.delete(
    "/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await deletePrinter(id);
      return reply.status(204).send();
    },
  );
}
