import { z } from "zod";

export const createClinicInput = z.object({
  name: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be lower-case alphanumeric and hyphenated"),
  ownerUserEmail: z.string().email().optional(),
});

export const updateClinicInput = z.object({
  name: z.string().min(3).optional(),
  logoUrl: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  timezone: z.string().optional(),
  currency: z.enum(["MXN", "USD", "EUR"]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  website: z.string().url().nullable().optional(),
  description: z.string().max(500).optional(),
  settings: z.record(z.any()).optional(),
});

export const clinicResponse = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
});

export const clinicDetailResponse = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  timezone: z.string().nullable(),
  currency: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  settings: z.record(z.any()).nullable(),
  stripeAccountId: z.string().nullable(),
  stripeOnboardingComplete: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateClinicInput = z.infer<typeof createClinicInput>;
export type UpdateClinicInput = z.infer<typeof updateClinicInput>;
