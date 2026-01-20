import type { FastifyInstance } from "fastify";
import { terminalCreateInput, terminalUpdateInput } from "./terminal.schema";
import { listTerminals, createTerminal, updateTerminal, deleteTerminal } from "./terminal.service";

export async function posTerminalRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.authenticate] }, async () => listTerminals());

  app.post(
    "/",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = terminalCreateInput.parse(request.body);
      try {
        const terminal = await createTerminal(body);
        return reply.code(201).send(terminal);
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
      const body = terminalUpdateInput.parse(request.body ?? {});
      try {
        const terminal = await updateTerminal(id, body);
        return reply.send(terminal);
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
      await deleteTerminal(id);
      return reply.status(204).send();
    },
  );
}
