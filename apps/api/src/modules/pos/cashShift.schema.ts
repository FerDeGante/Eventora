import { z } from "zod";

export const openShiftInput = z.object({
  branchId: z.string().optional(),
  openingAmount: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
});

export const closeShiftInput = z.object({
  shiftId: z.string().min(1),
  closingAmount: z.number().int().nonnegative(),
  notes: z.string().optional(),
});
