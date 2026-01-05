import { z } from "zod";

export const packageCreateInput = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  sessions: z.number().int().positive(),
  validityDays: z.number().int().positive(),
  defaultDuration: z.number().int().positive().default(60),
  basePrice: z.number().int().nonnegative(),
  inscriptionFee: z.number().int().nonnegative().default(0),
  stripePriceId: z.string().optional(),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        mandatory: z.boolean().default(true),
        sequence: z.number().int().nonnegative().default(0),
      }),
    )
    .optional(),
});

export const packageUpdateInput = packageCreateInput.partial();
