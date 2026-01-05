import type { FastifyInstance } from "fastify";
import {
  createReservationInput,
  listReservationsQuery,
  updateReservationInput,
  updateReservationStatusInput,
} from "./reservation.schema";
import { 
  createReservation, 
  listReservations,
  getReservationById,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
} from "./reservation.service";

export async function reservationRoutes(app: FastifyInstance) {
  app.post(
    "/",
    async (request, reply) => {
      const body = createReservationInput.parse(request.body);
      try {
        const reservation = await createReservation(body);
        return reply.code(201).send(reservation);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.get("/", { preHandler: [app.authenticate] }, async (request) => {
    const query = listReservationsQuery.parse(request.query ?? {});
    return listReservations(query);
  });

  app.get("/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const reservation = await getReservationById(id);
      return reply.send(reservation);
    } catch (error: any) {
      return reply.code(404).send({ message: error.message });
    }
  });

  app.patch(
    "/:id",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateReservationInput.parse(request.body ?? {});
      try {
        const reservation = await updateReservation(id, body);
        return reply.send(reservation);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.patch(
    "/:id/status",
    {
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateReservationStatusInput.parse(request.body);
      try {
        const reservation = await updateReservationStatus(id, body);
        return reply.send(reservation);
      } catch (error: any) {
        return reply.code(400).send({ message: error.message });
      }
    },
  );

  app.delete("/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await deleteReservation(id);
      return reply.send(result);
    } catch (error: any) {
      return reply.code(400).send({ message: error.message });
    }
  });
}
