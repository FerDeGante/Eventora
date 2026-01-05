import { z } from "zod";

export const createClinicInput = z.object({
  name: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lower-case alphanumeric and hyphenated"),
  ownerUserEmail: z.string().email().optional(),
});

export const clinicResponse = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
});

export type CreateClinicInput = z.infer<typeof createClinicInput>;
