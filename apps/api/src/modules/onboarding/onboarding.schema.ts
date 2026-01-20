import { z } from 'zod';

export const signupSchema = z.object({
  // Datos del usuario
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  
  // Datos del workspace
  workspaceName: z.string().min(2).max(100),
  workspaceSlug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens allowed')
    .optional(), // Se generará del nombre si no se proporciona
  
  // Plan
  planId: z.string().cuid(),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
  
  // Metadata
  referralCode: z.string().optional(),
  source: z.string().optional(), // utm_source
});

export const checkSlugSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
});

export const verifyEmailSchema = z.object({
  token: z.string(),
});

export const selectPlanSchema = z.object({
  planId: z.string().cuid(),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type CheckSlugInput = z.infer<typeof checkSlugSchema>;
export type SelectPlanInput = z.infer<typeof selectPlanSchema>;
