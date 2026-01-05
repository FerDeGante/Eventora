import type { FastifyInstance } from "fastify";
import { generateReservationICS, syncReservationToGoogle } from "./calendar.service";

export async function calendarRoutes(app: FastifyInstance) {
  app.get(
    "/reservations/:id/ics",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const { ics } = await generateReservationICS(id);
        reply.header("Content-Type", "text/calendar");
        return reply.send(ics);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.post(
    "/reservations/:id/google",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { credentialId } = request.body as { credentialId: string };
      try {
        const data = await syncReservationToGoogle(id, credentialId);
        return reply.send(data);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );
}
