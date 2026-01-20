import type { FastifyInstance } from "fastify";
import { fetchNextPrintJob, acknowledgePrintJob } from "./printJob.service";
import { z } from "zod";

const nextJobQuery = z.object({ printerId: z.string().min(1) });
const ackBody = z.object({ success: z.boolean(), error: z.string().optional() });

export async function printJobRoutes(app: FastifyInstance) {
  app.get(
    "/next",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const query = nextJobQuery.parse(request.query ?? {});
      const job = await fetchNextPrintJob(query.printerId);
      if (!job) return reply.status(204).send();
      return job;
    },
  );

  app.post(
    "/:id/ack",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = ackBody.parse(request.body);
      await acknowledgePrintJob(id, body.success, body.error);
      return reply.send({ ok: true });
    },
  );
}
