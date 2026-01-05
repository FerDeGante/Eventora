import { z } from "zod";

export const checkoutSessionInput = z.object({
  clinicId: z.string().optional(),
  userId: z.string().min(1),
  mode: z.enum(["package", "reservation"]),
  priceId: z.string().optional(),
  amount: z.number().int().positive().optional(),
  currency: z.string().default("mxn"),
  reservationId: z.string().optional(),
  packageId: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  provider: z.enum(["stripe", "mercadopago", "cash", "terminal"]).default("stripe"),
  terminalId: z.string().optional(),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  provider: z.enum(["STRIPE", "MERCADOPAGO", "CASH", "TERMINAL"]).optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const refundInputSchema = z.object({
  reason: z.string().optional(),
  amount: z.number().int().positive().optional(), // Partial refund
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionInput>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
export type RefundInput = z.infer<typeof refundInputSchema>;
