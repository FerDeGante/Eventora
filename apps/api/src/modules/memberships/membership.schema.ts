import { z } from 'zod';
import { MembershipType, BillingCycle, MembershipStatus } from '@prisma/client';

// ============================================
// MEMBERSHIP SCHEMAS
// ============================================

export const membershipTypeEnum = z.nativeEnum(MembershipType);
export const billingCycleEnum = z.nativeEnum(BillingCycle);
export const membershipStatusEnum = z.nativeEnum(MembershipStatus);

export const createMembershipSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: membershipTypeEnum.default('UNLIMITED'),
  
  // Precio
  price: z.number().int().min(0).default(0),
  billingCycle: billingCycleEnum.default('MONTHLY'),
  inscriptionFee: z.number().int().min(0).default(0),
  
  // Límites
  sessionsTotal: z.number().int().min(1).optional(),
  sessionsPerPeriod: z.number().int().min(1).optional(),
  periodType: billingCycleEnum.optional(),
  durationDays: z.number().int().min(1).optional(),
  
  // Restricciones
  allowedServices: z.array(z.string()).default([]),
  allowedBranches: z.array(z.string()).default([]),
  maxFreezeDays: z.number().int().min(0).default(0),
  gracePeriodDays: z.number().int().min(0).default(3),
  
  // Stripe
  stripePriceId: z.string().optional(),
  stripeProductId: z.string().optional(),
  
  // Estado
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  metadata: z.record(z.any()).optional(),
});

export const updateMembershipSchema = createMembershipSchema.partial();

export const membershipQuerySchema = z.object({
  type: membershipTypeEnum.optional(),
  isPublic: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ============================================
// USER MEMBERSHIP SCHEMAS
// ============================================

export const createUserMembershipSchema = z.object({
  userId: z.string().cuid(),
  membershipId: z.string().cuid(),
  status: membershipStatusEnum.default('ACTIVE'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  pricePaid: z.number().int().min(0).default(0),
  autoRenew: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

export const updateUserMembershipSchema = z.object({
  status: membershipStatusEnum.optional(),
  endDate: z.coerce.date().optional(),
  autoRenew: z.boolean().optional(),
  pausedAt: z.coerce.date().optional(),
  pauseEndDate: z.coerce.date().optional(),
});

export const userMembershipQuerySchema = z.object({
  userId: z.string().cuid().optional(),
  membershipId: z.string().cuid().optional(),
  status: membershipStatusEnum.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// ============================================
// CHECK-IN SCHEMAS
// ============================================

export const checkInSchema = z.object({
  userMembershipId: z.string().cuid(),
  serviceId: z.string().cuid().optional(),
  branchId: z.string().cuid().optional(),
  notes: z.string().optional(),
});

export const checkOutSchema = z.object({
  checkInId: z.string().cuid(),
});

// Type exports
export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
export type MembershipQuery = z.infer<typeof membershipQuerySchema>;
export type CreateUserMembershipInput = z.infer<typeof createUserMembershipSchema>;
export type UpdateUserMembershipInput = z.infer<typeof updateUserMembershipSchema>;
export type UserMembershipQuery = z.infer<typeof userMembershipQuerySchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
