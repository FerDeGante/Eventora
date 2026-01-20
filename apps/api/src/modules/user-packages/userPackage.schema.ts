import { z } from "zod";

export const createUserPackageInput = z.object({
  userId: z.string().min(1),
  packageId: z.string().min(1),
  sessionsTotal: z.number().int().positive().optional(),
  pricePaid: z.number().int().nonnegative().optional(),
  paymentSource: z.enum(["STRIPE", "CASH", "POS", "MERCADO_PAGO"]).optional(),
});

export const transferSessionsInput = z.object({
  fromUserPackageId: z.string().min(1),
  toUserId: z.string().min(1),
  sessions: z.number().int().positive(),
});

export const consumeSessionInput = z.object({
  sessions: z.number().int().positive().default(1),
});

export type CreateUserPackageInput = z.infer<typeof createUserPackageInput>;
export type TransferSessionsInput = z.infer<typeof transferSessionsInput>;
export type ConsumeSessionInput = z.infer<typeof consumeSessionInput>;
