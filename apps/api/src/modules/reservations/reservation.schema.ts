import { z } from "zod";
import { paginationQuery } from "../../utils/pagination";

export const createReservationInput = z.object({
  serviceId: z.string().min(1),
  userId: z.string().min(1),
  branchId: z.string().min(1),
  startAt: z.coerce.date(),
  durationMinutes: z.number().int().positive().max(600).optional(),
  therapistId: z.string().optional(),
  resourceId: z.string().optional(),
  userPackageId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const listReservationsQuery = paginationQuery.extend({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
});

export const updateReservationInput = z.object({
  startAt: z.coerce.date().optional(),
  durationMinutes: z.number().int().positive().max(600).optional(),
  therapistId: z.string().optional(),
  resourceId: z.string().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
});

export const updateReservationStatusInput = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

export type CreateReservationInput = z.infer<typeof createReservationInput>;
export type ListReservationsQuery = z.infer<typeof listReservationsQuery>;
export type UpdateReservationInput = z.infer<typeof updateReservationInput>;
export type UpdateReservationStatusInput = z.infer<typeof updateReservationStatusInput>;
