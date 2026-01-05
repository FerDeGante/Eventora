import { prisma } from '../../lib/prisma';
import { 
  CreateMembershipInput, 
  UpdateMembershipInput, 
  MembershipQuery,
  CreateUserMembershipInput,
  UpdateUserMembershipInput,
  UserMembershipQuery,
  CheckInInput,
} from './membership.schema';
import { MembershipType, BillingCycle } from '@prisma/client';

// ============================================
// MEMBERSHIP CRUD
// ============================================

export async function listMemberships(clinicId: string, query: MembershipQuery) {
  const { type, isPublic, limit, offset } = query;
  
  const where = {
    clinicId,
    ...(type && { type }),
    ...(isPublic !== undefined && { isPublic }),
  };
  
  const [memberships, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: limit,
      skip: offset,
    }),
    prisma.membership.count({ where }),
  ]);
  
  return { memberships, total, limit, offset };
}

export async function getMembershipById(clinicId: string, id: string) {
  return prisma.membership.findFirst({
    where: { id, clinicId },
    include: {
      _count: {
        select: { userMemberships: true },
      },
    },
  });
}

export async function createMembership(clinicId: string, input: CreateMembershipInput) {
  // Validar que los campos requeridos según el tipo estén presentes
  validateMembershipType(input);
  
  return prisma.membership.create({
    data: {
      clinicId,
      ...input,
    },
  });
}

export async function updateMembership(clinicId: string, id: string, input: UpdateMembershipInput) {
  const existing = await prisma.membership.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  
  // Si cambia el tipo, validar campos requeridos
  if (input.type) {
    validateMembershipType({ ...existing, ...input } as CreateMembershipInput);
  }
  
  return prisma.membership.update({
    where: { id },
    data: input,
  });
}

export async function deleteMembership(clinicId: string, id: string) {
  const existing = await prisma.membership.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  
  // Verificar que no tenga membresías activas
  const activeCount = await prisma.userMembership.count({
    where: { membershipId: id, status: { in: ['ACTIVE', 'PAUSED'] } },
  });
  
  if (activeCount > 0) {
    throw new Error(`Cannot delete membership with ${activeCount} active subscriptions`);
  }
  
  return prisma.membership.delete({ where: { id } });
}

// ============================================
// USER MEMBERSHIP CRUD
// ============================================

export async function listUserMemberships(clinicId: string, query: UserMembershipQuery) {
  const { userId, membershipId, status, limit, offset } = query;
  
  const where = {
    clinicId,
    ...(userId && { userId }),
    ...(membershipId && { membershipId }),
    ...(status && { status }),
  };
  
  const [userMemberships, total] = await Promise.all([
    prisma.userMembership.findMany({
      where,
      include: {
        membership: { select: { name: true, type: true, price: true } },
        user: { select: { name: true, email: true } },
        _count: { select: { checkIns: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.userMembership.count({ where }),
  ]);
  
  return { userMemberships, total, limit, offset };
}

export async function getUserMembershipById(clinicId: string, id: string) {
  return prisma.userMembership.findFirst({
    where: { id, clinicId },
    include: {
      membership: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      checkIns: {
        orderBy: { checkInAt: 'desc' },
        take: 10,
      },
    },
  });
}

export async function createUserMembership(clinicId: string, input: CreateUserMembershipInput) {
  const membership = await prisma.membership.findFirst({
    where: { id: input.membershipId, clinicId },
  });
  
  if (!membership) {
    throw new Error('Membership not found');
  }
  
  // Calcular sessionsRemaining según el tipo
  let sessionsRemaining: number | null = null;
  if (membership.type === 'SESSIONS_TOTAL' && membership.sessionsTotal) {
    sessionsRemaining = membership.sessionsTotal;
  } else if (membership.type === 'SESSIONS_PERIOD' && membership.sessionsPerPeriod) {
    sessionsRemaining = membership.sessionsPerPeriod;
  }
  
  // Calcular endDate si es TIME_BASED
  let endDate = input.endDate;
  if (!endDate && membership.type === 'TIME_BASED' && membership.durationDays) {
    endDate = new Date();
    endDate.setDate(endDate.getDate() + membership.durationDays);
  }
  
  // Calcular nextBillingDate y periodResetDate
  const startDate = input.startDate || new Date();
  const nextBillingDate = calculateNextBillingDate(startDate, membership.billingCycle);
  const periodResetDate = membership.type === 'SESSIONS_PERIOD' 
    ? calculateNextBillingDate(startDate, membership.periodType || 'WEEKLY')
    : null;
  
  return prisma.userMembership.create({
    data: {
      clinicId,
      userId: input.userId,
      membershipId: input.membershipId,
      status: input.status || 'ACTIVE',
      startDate,
      endDate,
      nextBillingDate,
      sessionsRemaining,
      periodResetDate,
      pricePaid: input.pricePaid || membership.price,
      autoRenew: input.autoRenew ?? true,
      metadata: input.metadata,
    },
    include: {
      membership: { select: { name: true, type: true } },
      user: { select: { name: true, email: true } },
    },
  });
}

export async function updateUserMembership(
  clinicId: string, 
  id: string, 
  input: UpdateUserMembershipInput
) {
  const existing = await prisma.userMembership.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  
  return prisma.userMembership.update({
    where: { id },
    data: input,
  });
}

export async function cancelUserMembership(clinicId: string, id: string, immediate = false) {
  const existing = await prisma.userMembership.findFirst({ where: { id, clinicId } });
  if (!existing) return null;
  
  if (immediate) {
    return prisma.userMembership.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
  
  // Cancelar al final del periodo
  return prisma.userMembership.update({
    where: { id },
    data: { autoRenew: false },
  });
}

// ============================================
// CHECK-IN / CHECK-OUT
// ============================================

export async function checkIn(clinicId: string, input: CheckInInput) {
  const userMembership = await prisma.userMembership.findFirst({
    where: { id: input.userMembershipId, clinicId },
    include: { membership: true },
  });
  
  if (!userMembership) {
    throw new Error('User membership not found');
  }
  
  if (userMembership.status !== 'ACTIVE') {
    throw new Error(`Membership is ${userMembership.status.toLowerCase()}`);
  }
  
  // Verificar si tiene sesiones disponibles
  const membership = userMembership.membership;
  
  if (membership.type === 'SESSIONS_TOTAL') {
    if (userMembership.sessionsRemaining !== null && userMembership.sessionsRemaining <= 0) {
      throw new Error('No sessions remaining');
    }
  }
  
  if (membership.type === 'SESSIONS_PERIOD') {
    // Verificar si necesita reset del periodo
    if (userMembership.periodResetDate && new Date() >= userMembership.periodResetDate) {
      await prisma.userMembership.update({
        where: { id: userMembership.id },
        data: {
          periodSessionsUsed: 0,
          periodResetDate: calculateNextBillingDate(new Date(), membership.periodType || 'WEEKLY'),
        },
      });
      userMembership.periodSessionsUsed = 0;
    }
    
    if (membership.sessionsPerPeriod && userMembership.periodSessionsUsed >= membership.sessionsPerPeriod) {
      throw new Error('Period session limit reached');
    }
  }
  
  // Verificar restricciones de servicio
  if (input.serviceId && membership.allowedServices.length > 0) {
    if (!membership.allowedServices.includes(input.serviceId)) {
      throw new Error('Service not allowed with this membership');
    }
  }
  
  // Verificar restricciones de sucursal
  if (input.branchId && membership.allowedBranches.length > 0) {
    if (!membership.allowedBranches.includes(input.branchId)) {
      throw new Error('Branch not allowed with this membership');
    }
  }
  
  // Crear check-in y actualizar contadores
  const [checkIn] = await prisma.$transaction([
    prisma.membershipCheckIn.create({
      data: {
        clinicId,
        userMembershipId: userMembership.id,
        serviceId: input.serviceId,
        branchId: input.branchId,
        notes: input.notes,
      },
    }),
    prisma.userMembership.update({
      where: { id: userMembership.id },
      data: {
        sessionsUsed: { increment: 1 },
        ...(membership.type === 'SESSIONS_TOTAL' && userMembership.sessionsRemaining !== null
          ? { sessionsRemaining: { decrement: 1 } }
          : {}),
        ...(membership.type === 'SESSIONS_PERIOD'
          ? { periodSessionsUsed: { increment: 1 } }
          : {}),
      },
    }),
  ]);
  
  return checkIn;
}

export async function checkOut(clinicId: string, checkInId: string) {
  const existing = await prisma.membershipCheckIn.findFirst({
    where: { id: checkInId, clinicId },
  });
  
  if (!existing) {
    throw new Error('Check-in not found');
  }
  
  if (existing.checkOutAt) {
    throw new Error('Already checked out');
  }
  
  return prisma.membershipCheckIn.update({
    where: { id: checkInId },
    data: { checkOutAt: new Date() },
  });
}

export async function getCheckInHistory(
  clinicId: string, 
  userMembershipId: string, 
  limit = 50, 
  offset = 0
) {
  const [checkIns, total] = await Promise.all([
    prisma.membershipCheckIn.findMany({
      where: { clinicId, userMembershipId },
      orderBy: { checkInAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.membershipCheckIn.count({ where: { clinicId, userMembershipId } }),
  ]);
  
  return { checkIns, total, limit, offset };
}

// ============================================
// HELPERS
// ============================================

function validateMembershipType(input: CreateMembershipInput) {
  const { type, sessionsTotal, sessionsPerPeriod, periodType, durationDays } = input;
  
  switch (type) {
    case 'SESSIONS_TOTAL':
      if (!sessionsTotal || sessionsTotal < 1) {
        throw new Error('sessionsTotal is required for SESSIONS_TOTAL type');
      }
      break;
    case 'SESSIONS_PERIOD':
      if (!sessionsPerPeriod || sessionsPerPeriod < 1) {
        throw new Error('sessionsPerPeriod is required for SESSIONS_PERIOD type');
      }
      if (!periodType) {
        throw new Error('periodType is required for SESSIONS_PERIOD type');
      }
      break;
    case 'TIME_BASED':
      if (!durationDays || durationDays < 1) {
        throw new Error('durationDays is required for TIME_BASED type');
      }
      break;
  }
}

function calculateNextBillingDate(fromDate: Date, cycle: BillingCycle): Date {
  const date = new Date(fromDate);
  
  switch (cycle) {
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'BIWEEKLY':
      date.setDate(date.getDate() + 14);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'BIANNUAL':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'ONE_TIME':
      return new Date(8640000000000000); // Max date
  }
  
  return date;
}
