import { z } from "zod";

export const printerCreateInput = z.object({
  name: z.string().min(2),
  terminalId: z.string().optional(),
  type: z.string().default("thermal"),
  connection: z.string().default("network"),
  metadata: z.record(z.any()).optional(),
});

export const printerUpdateInput = printerCreateInput.partial();
