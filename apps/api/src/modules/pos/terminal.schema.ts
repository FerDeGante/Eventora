import { z } from "zod";

export const terminalCreateInput = z.object({
  name: z.string().min(2),
  branchId: z.string().optional(),
  type: z.string().default("terminal"),
  metadata: z.record(z.any()).optional(),
});

export const terminalUpdateInput = terminalCreateInput.partial();
