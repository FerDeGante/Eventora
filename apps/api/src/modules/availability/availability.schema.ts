import { z } from "zod";

export const availabilityQuery = z.object({
  serviceId: z.string().min(1),
  branchId: z.string().min(1),
  date: z.string().min(1), // ISO yyyy-mm-dd
});

export const createTemplateInput = z.object({
  ownerType: z.enum(["BRANCH", "SERVICE", "THERAPIST", "RESOURCE"]),
  ownerId: z.string().min(1),
  branchId: z.string().optional(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().min(15).max(240).default(60),
  capacity: z.number().int().min(1).default(1),
});

export const updateTemplateInput = z.object({
  weekday: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  slotDuration: z.number().int().min(15).max(240).optional(),
  capacity: z.number().int().min(1).optional(),
});

export const templateQuerySchema = z.object({
  ownerType: z.enum(["BRANCH", "SERVICE", "THERAPIST", "RESOURCE"]).optional(),
  ownerId: z.string().optional(),
  branchId: z.string().optional(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuery>;
export type CreateTemplateInput = z.infer<typeof createTemplateInput>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateInput>;
export type TemplateQuery = z.infer<typeof templateQuerySchema>;
