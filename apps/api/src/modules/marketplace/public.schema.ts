import { z } from "zod";

export const publicSearchQuery = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
});

export const publicAvailabilityQuery = z.object({
  clinicSlug: z.string().optional(),
  serviceId: z.string().min(1),
  branchId: z.string().optional(),
  date: z.string().min(1),
});

export const publicBranchQuery = z.object({
  clinicSlug: z.string().optional(),
});

export const publicServiceQuery = z.object({
  clinicSlug: z.string().optional(),
});
