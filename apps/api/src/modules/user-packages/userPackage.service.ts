import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

export const listUserPackages = async (userId: string) => {
  const { clinicId } = assertTenant();
  return prisma.userPackage.findMany({
    where: { clinicId, userId },
    include: {
      package: {
        select: { name: true, sessions: true, validityDays: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const assignUserPackage = async (input: {
  userId: string;
  packageId: string;
  sessionsTotal?: number;
  pricePaid?: number;
  paymentSource?: "STRIPE" | "CASH" | "POS" | "MERCADO_PAGO";
}) => {
  const { clinicId } = assertTenant();
  const pkg = await prisma.package.findFirst({ where: { id: input.packageId, clinicId } });
  if (!pkg) throw new Error("Package not found");

  const sessions = input.sessionsTotal ?? pkg.sessions;
  const record = await prisma.userPackage.create({
    data: {
      clinicId,
      userId: input.userId,
      packageId: input.packageId,
      sessionsTotal: sessions,
      sessionsRemaining: sessions,
      pricePaid: input.pricePaid ?? 0,
      paymentSource: input.paymentSource ?? "CASH",
      startDate: new Date(),
      expiryDate: new Date(Date.now() + pkg.validityDays * 24 * 60 * 60 * 1000),
    },
  });
  return record;
};

export const transferSessions = async (fromUserPackageId: string, toUserId: string, sessions: number) => {
  const { clinicId } = assertTenant();
  const source = await prisma.userPackage.findFirst({ where: { id: fromUserPackageId, clinicId } });
  if (!source) throw new Error("Source package not found");
  if (source.sessionsRemaining < sessions) throw new Error("Insufficient sessions");

  const target = await prisma.userPackage.create({
    data: {
      clinicId,
      userId: toUserId,
      packageId: source.packageId,
      sessionsTotal: sessions,
      sessionsRemaining: sessions,
      pricePaid: 0,
      paymentSource: "CASH",
    },
  });

  await prisma.userPackage.update({
    where: { id: source.id },
    data: { sessionsRemaining: { decrement: sessions } },
  });

  return target;
};

export const getUserPackageById = async (id: string) => {
  const { clinicId } = assertTenant();
  
  const userPackage = await prisma.userPackage.findFirst({
    where: { id, clinicId },
    include: {
      package: {
        select: { 
          name: true, 
          sessions: true, 
          validityDays: true,
          description: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!userPackage) {
    throw new Error("User package not found");
  }

  return userPackage;
};

export const listAllUserPackages = async () => {
  const { clinicId } = assertTenant();
  
  return prisma.userPackage.findMany({
    where: { clinicId },
    include: {
      package: {
        select: { name: true, sessions: true },
      },
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const consumeSession = async (id: string, sessions: number = 1) => {
  const { clinicId } = assertTenant();
  
  const userPackage = await prisma.userPackage.findFirst({
    where: { id, clinicId },
  });

  if (!userPackage) {
    throw new Error("User package not found");
  }

  if (userPackage.sessionsRemaining < sessions) {
    throw new Error("Insufficient sessions remaining");
  }

  // Verificar que no esté expirado
  if (userPackage.expiryDate && userPackage.expiryDate < new Date()) {
    throw new Error("Package has expired");
  }

  return prisma.userPackage.update({
    where: { id },
    data: {
      sessionsRemaining: { decrement: sessions },
    },
    include: {
      package: {
        select: { name: true, sessions: true },
      },
    },
  });
};
