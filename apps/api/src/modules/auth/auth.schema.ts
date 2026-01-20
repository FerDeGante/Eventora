import { z } from "zod";

export const registerInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(["CLIENT", "ADMIN", "MANAGER", "RECEPTION", "THERAPIST"]).optional(),
});

export const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const passwordResetRequestInput = z.object({
  email: z.string().email(),
});

export const passwordResetInput = z.object({
  email: z.string().email(),
  token: z.string().min(4),
  newPassword: z.string().min(8),
});

export const twoFactorVerifyInput = z.object({
  email: z.string().email(),
  token: z.string().min(4),
});

export const toggleTwoFactorInput = z.object({
  enabled: z.boolean(),
});
