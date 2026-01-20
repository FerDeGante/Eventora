import { z } from "zod";

export const serviceCreateInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  defaultDuration: z.number().int().positive().max(480),
  basePrice: z.number().positive(),
  categoryId: z.string().optional(),
  isPackageable: z.boolean().optional(),
});

export const serviceUpdateInput = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  defaultDuration: z.number().int().positive().max(480).optional(),
  basePrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  isPackageable: z.boolean().optional(),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateInput>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateInput>;
