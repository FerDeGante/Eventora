import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { withResolvedTenant } from "../../utils/tenant-resolver";
import { enqueueDemoTicket, listPosTickets, reprintTicket } from "./ticket.service";

const ticketIdParams = z.object({ id: z.string().min(1) });

export async function posTicketRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    try {
      const clinicId = request.headers["x-clinic-id"] as string | undefined;
      return await withResolvedTenant(clinicId, () => listPosTickets());
    } catch (error: any) {
      request.log.error({ error }, "Failed to fetch POS tickets");
      return reply.status(400).send({ message: error.message });
    }
  });

  app.post("/:id/print", async (request, reply) => {
    const { id } = ticketIdParams.parse(request.params ?? {});
    try {
      const clinicId = request.headers["x-clinic-id"] as string | undefined;
      await withResolvedTenant(clinicId, () => reprintTicket(id));
      return { ok: true };
    } catch (error: any) {
      request.log.error({ error }, "Failed to reprint ticket");
      return reply.status(400).send({ message: error.message });
    }
  });

  app.post("/print-demo", async (request, reply) => {
    try {
      const clinicId = request.headers["x-clinic-id"] as string | undefined;
      await withResolvedTenant(clinicId, () => enqueueDemoTicket());
      return { ok: true };
    } catch (error: any) {
      request.log.error({ error }, "Failed to enqueue demo ticket");
      return reply.status(400).send({ message: error.message });
    }
  });
}
