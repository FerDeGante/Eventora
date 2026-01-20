import type { FastifyInstance } from "fastify";
import { openShiftInput, closeShiftInput } from "./cashShift.schema";
import { listCashShifts, openCashShift, closeCashShift } from "./cashShift.service";

export async function cashShiftRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [app.authenticate] }, async () => listCashShifts());

  app.post(
    "/open",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = openShiftInput.parse(request.body);
      try {
        const shift = await openCashShift(body, request.user.sub as string);
        return reply.code(201).send(shift);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );

  app.post(
    "/close",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const body = closeShiftInput.parse(request.body);
      try {
        const shift = await closeCashShift(body, request.user.sub as string);
        return reply.send(shift);
      } catch (error: any) {
        return reply.status(400).send({ message: error.message });
      }
    },
  );
}
