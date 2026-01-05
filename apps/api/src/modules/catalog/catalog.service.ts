import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

export const listServices = async () => {
  const { clinicId } = assertTenant();
  return prisma.service.findMany({
    where: { clinicId, isPackageable: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      defaultDuration: true,
      basePrice: true,
      category: { select: { name: true, colorHex: true } },
    },
  });
};

export const createService = async (input: {
  name: string;
  description?: string;
  defaultDuration: number;
  basePrice: number;
  categoryId?: string;
  isPackageable?: boolean;
}) => {
  const { clinicId } = assertTenant();
  
  return prisma.service.create({
    data: {
      clinicId,
      name: input.name,
      description: input.description,
      defaultDuration: input.defaultDuration,
      basePrice: input.basePrice,
      categoryId: input.categoryId,
      isPackageable: input.isPackageable ?? true,
    },
    include: {
      category: { select: { name: true, colorHex: true } },
    },
  });
};

export const updateService = async (id: string, input: Partial<{
  name: string;
  description?: string;
  defaultDuration: number;
  basePrice: number;
  categoryId?: string;
  isPackageable?: boolean;
}>) => {
  const { clinicId } = assertTenant();
  
  const existing = await prisma.service.findFirst({ where: { id, clinicId } });
  if (!existing) throw new Error("Service not found");

  return prisma.service.update({
    where: { id },
    data: input,
    include: {
      category: { select: { name: true, colorHex: true } },
    },
  });
};

export const deleteService = async (id: string) => {
  const { clinicId } = assertTenant();
  
  const existing = await prisma.service.findFirst({ where: { id, clinicId } });
  if (!existing) throw new Error("Service not found");

  // Verificar que no esté siendo usado en paquetes activos
  const packagesUsingService = await prisma.packageService.count({
    where: { 
      serviceId: id,
      package: { status: "ACTIVE" }
    },
  });

  if (packagesUsingService > 0) {
    throw new Error("Cannot delete service that is part of active packages");
  }

  await prisma.service.delete({
    where: { id },
  });

  return { success: true };
};

export const listPackages = async () => {
  const { clinicId } = assertTenant();
  return prisma.package.findMany({
    where: { clinicId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      sessions: true,
      validityDays: true,
      basePrice: true,
      stripePriceId: true,
      defaultDuration: true,
      inscriptionFee: true,
      services: {
        select: {
          serviceId: true,
          mandatory: true,
          sequence: true,
          service: { select: { name: true } },
        },
      },
    },
  });
};

export const getPackageById = async (id: string) => {
  const { clinicId } = assertTenant();
  return prisma.package.findFirst({
    where: { id, clinicId },
    include: {
      services: {
        orderBy: { sequence: "asc" },
      },
    },
  });
};

export const createPackage = async (input: {
  name: string;
  description?: string;
  sessions: number;
  validityDays: number;
  defaultDuration?: number;
  basePrice: number;
  inscriptionFee?: number;
  stripePriceId?: string;
  services?: { serviceId: string; mandatory?: boolean; sequence?: number }[];
}) => {
  const { clinicId } = assertTenant();
  const pkg = await prisma.package.create({
    data: {
      clinicId,
      name: input.name,
      description: input.description,
      sessions: input.sessions,
      validityDays: input.validityDays,
      defaultDuration: input.defaultDuration ?? 60,
      basePrice: input.basePrice,
      inscriptionFee: input.inscriptionFee ?? 0,
      stripePriceId: input.stripePriceId,
      status: "ACTIVE",
      services: input.services
        ? {
            create: input.services.map((svc, idx) => ({
              serviceId: svc.serviceId,
              mandatory: svc.mandatory ?? true,
              sequence: svc.sequence ?? idx,
            })),
          }
        : undefined,
    },
    include: {
      services: true,
    },
  });
  return pkg;
};

export const updatePackage = async (id: string, input: Partial<Parameters<typeof createPackage>[0]>) => {
  const { clinicId } = assertTenant();
  const existing = await prisma.package.findFirst({ where: { id, clinicId } });
  if (!existing) throw new Error("Package not found");

  const pkg = await prisma.package.update({
    where: { id },
    data: {
      name: input.name ?? existing.name,
      description: input.description ?? existing.description,
      sessions: input.sessions ?? existing.sessions,
      validityDays: input.validityDays ?? existing.validityDays,
      defaultDuration: input.defaultDuration ?? existing.defaultDuration,
      basePrice: input.basePrice ?? existing.basePrice,
      inscriptionFee: input.inscriptionFee ?? existing.inscriptionFee,
      stripePriceId: input.stripePriceId ?? existing.stripePriceId,
      services: input.services
        ? {
            deleteMany: {},
            create: input.services.map((svc, idx) => ({
              serviceId: svc.serviceId,
              mandatory: svc.mandatory ?? true,
              sequence: svc.sequence ?? idx,
            })),
          }
        : undefined,
    },
    include: { services: true },
  });
  return pkg;
};

export const deletePackage = async (id: string) => {
  const { clinicId } = assertTenant();
  await prisma.package.updateMany({
    where: { id, clinicId },
    data: { status: "INACTIVE" },
  });
};
