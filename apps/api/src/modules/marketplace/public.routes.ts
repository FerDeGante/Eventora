import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { publicSearchQuery, publicAvailabilityQuery, publicBranchQuery, publicServiceQuery } from "./public.schema";
import { listPublicClinics, getPublicClinicBySlug, listPublicBranches, listPublicServices, publicAvailability } from "./public.service";
import { createPublicBooking, createPublicCheckout, getPublicBookingStatus } from "./public-booking.service";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/clinics", async (request) => {
    const query = publicSearchQuery.parse(request.query ?? {});
    return listPublicClinics(query);
  });

  app.get("/clinics/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const clinic = await getPublicClinicBySlug(slug);
    if (!clinic) {
      return reply.status(404).send({ message: "Clinic not found" });
    }
    return clinic;
  });

  app.get("/branches", async (request) => {
    const query = publicBranchQuery.parse(request.query ?? {});
    return listPublicBranches(query.clinicSlug);
  });

  app.get("/services", async (request) => {
    const query = publicServiceQuery.parse(request.query ?? {});
    return listPublicServices(query.clinicSlug);
  });

  app.get("/availability", async (request, reply) => {
    const query = publicAvailabilityQuery.parse(request.query ?? {});
    try {
      const slots = await publicAvailability({ ...query, branchId: query.branchId ?? "" });
      return slots;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  });

  // ============================================
  // PUBLIC BOOKING ENDPOINTS
  // ============================================

  const createBookingSchema = z.object({
    clinicId: z.string(),
    branchId: z.string(),
    serviceId: z.string(),
    therapistId: z.string().optional(),
    startAt: z.string().datetime(),
    clientName: z.string().min(2),
    clientEmail: z.string().email(),
    clientPhone: z.string().optional(),
    notes: z.string().optional(),
    requiresPayment: z.boolean().default(false),
  });

  // Create a public booking (no auth required)
  app.post("/bookings", async (request, reply) => {
    try {
      const input = createBookingSchema.parse(request.body);
      const result = await createPublicBooking(input);
      return reply.status(201).send(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return reply.status(400).send({ message: "Invalid input", errors: error.errors });
      }
      return reply.status(400).send({ message: error.message });
    }
  });

  // Get booking status by ID
  app.get("/bookings/:bookingId", async (request, reply) => {
    const { bookingId } = request.params as { bookingId: string };
    try {
      const booking = await getPublicBookingStatus(bookingId);
      if (!booking) {
        return reply.status(404).send({ message: "Booking not found" });
      }
      return booking;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message });
    }
  });

  const createCheckoutSchema = z.object({
    bookingId: z.string(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  });

  // Create checkout session for a booking
  app.post("/bookings/:bookingId/checkout", async (request, reply) => {
    const { bookingId } = request.params as { bookingId: string };
    try {
      const input = createCheckoutSchema.parse({ ...(request.body as object), bookingId });
      const result = await createPublicCheckout(input);
      return reply.send(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return reply.status(400).send({ message: "Invalid input", errors: error.errors });
      }
      return reply.status(400).send({ message: error.message });
    }
  });
}
