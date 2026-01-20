import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
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
import { enforceRateLimit, RateLimitError } from "../../lib/rate-limit";
import { requireRoles } from "../../utils/rbac";

// A4 FIX: Rate limit para prevenir spam de reservaciones
const reservationRateLimitGuard = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await enforceRateLimit(request, { 
      keyPrefix: "reservations:create", 
      limit: 10, 
      windowSeconds: 60,
      identifier: request.ip 
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return reply
        .header("Retry-After", error.retryAfterSeconds)
        .status(429)
        .send({ message: "Demasiadas reservaciones. Intenta de nuevo en un momento." });
    }
    throw error;
  }
};

const reservationStaffGuard = requireRoles(["ADMIN", "MANAGER", "RECEPTION", "THERAPIST"]);

export async function reservationRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { preHandler: [app.authenticate, reservationRateLimitGuard, reservationStaffGuard] },
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

  app.get("/", { preHandler: [app.authenticate, reservationStaffGuard] }, async (request) => {
    const query = listReservationsQuery.parse(request.query ?? {});
    return listReservations(query);
  });

  app.get("/:id", { preHandler: [app.authenticate, reservationStaffGuard] }, async (request, reply) => {
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
      preHandler: [app.authenticate, reservationStaffGuard],
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
      preHandler: [app.authenticate, reservationStaffGuard],
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

  app.delete("/:id", { preHandler: [app.authenticate, reservationStaffGuard] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await deleteReservation(id);
      return reply.send(result);
    } catch (error: any) {
      return reply.code(400).send({ message: error.message });
    }
  });
}
