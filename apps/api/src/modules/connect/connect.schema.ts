import { z } from 'zod';

export const createConnectAccountSchema = z.object({
  refreshUrl: z.string().url().optional(),
  returnUrl: z.string().url().optional(),
});

export const connectAccountQuerySchema = z.object({
  code: z.string().optional(), // OAuth code
});

export type CreateConnectAccountInput = z.infer<typeof createConnectAccountSchema>;
