import { prisma } from "../../lib/prisma";
import { getAvailability } from "../availability/availability.service";
import type { AvailabilityQuery } from "../availability/availability.schema";
import { withTenantContext } from "../../lib/tenant-context";

const deriveCity = (address?: string | null) => {
  if (!address) return "Ciudad Eventora";
  const [city] = address.split(",").map((part) => part.trim());
  return city || "Ciudad Eventora";
};

const fallbackClinics = [
  { id: "clinic_cdmx", name: "Eventora Polanco", city: "CDMX", featuredService: "Hidroterapia Eventora", branches: 3 },
  { id: "clinic_gdl", name: "Eventora Andares", city: "Guadalajara", featuredService: "Spa sensorial", branches: 2 },
  { id: "clinic_mty", name: "Eventora San Pedro", city: "Monterrey", featuredService: "Rehab deportiva", branches: 1 },
];

export const listPublicClinics = async (query?: { q?: string; city?: string }) => {
  const clinics = await prisma.clinic.findMany({
    where: {
      ...(query?.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { slug: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      branches: {
        select: { id: true, name: true, address: true },
      },
      services: {
        select: { id: true, name: true, defaultDuration: true },
      },
    },
  });

  if (!clinics.length) return fallbackClinics;

  return clinics.map((clinic) => ({
    id: clinic.id,
    name: clinic.name,
    slug: clinic.slug,
    city: deriveCity(clinic.branches[0]?.address),
    featuredService: clinic.services[0]?.name,
    branches: clinic.branches.length,
  }));
};

export const listPublicBranches = async (clinicSlug?: string) => {
  const branches = await prisma.branch.findMany({
    where: {
      ...(clinicSlug ? { clinic: { slug: clinicSlug } } : {}),
    },
    select: {
      id: true,
      name: true,
      address: true,
      timezone: true,
      clinic: { select: { slug: true, name: true } },
    },
  });

  if (!branches.length) {
    return [
      { id: "branch_polanco", name: "Eventora Polanco", city: "CDMX", timezone: "America/Mexico_City", address: "CDMX" },
      { id: "branch_roma", name: "Eventora Roma", city: "CDMX", timezone: "America/Mexico_City", address: "CDMX" },
    ];
  }

  return branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    city: deriveCity(branch.address),
    address: branch.address ?? "",
    timezone: branch.timezone ?? "UTC",
    clinicSlug: branch.clinic.slug,
    clinicName: branch.clinic.name,
  }));
};

export const listPublicServices = async (clinicSlug?: string) => {
  const services = await prisma.service.findMany({
    where: {
      ...(clinicSlug ? { clinic: { slug: clinicSlug } } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      defaultDuration: true,
      basePrice: true,
      category: { select: { name: true } },
      clinic: { select: { id: true } },
    },
  });

  if (!services.length) {
    return [
      { id: "svc_hidro", name: "Hidroterapia sensorial", durationMinutes: 60, priceDisplay: "$1,850 MXN", category: "Fisioterapia" },
      { id: "svc_spa", name: "Eventora Signature Spa", durationMinutes: 75, priceDisplay: "$2,100 MXN", category: "Spa" },
    ];
  }

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description ?? undefined,
    durationMinutes: service.defaultDuration,
    price: service.basePrice > 10000 ? service.basePrice / 100 : service.basePrice,
    currency: "MXN",
    priceDisplay: new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(service.basePrice > 10000 ? service.basePrice / 100 : service.basePrice),
    category: service.category?.name ?? undefined,
  }));
};

export const publicAvailability = async (input: AvailabilityQuery & { clinicSlug?: string }) => {
  const clinicFromSlug = input.clinicSlug
    ? await prisma.clinic.findUnique({ where: { slug: input.clinicSlug } })
    : null;

  const clinicFromBranch = !clinicFromSlug && input.branchId
    ? await prisma.branch.findUnique({ where: { id: input.branchId }, select: { clinicId: true } })
    : null;

  const clinic = clinicFromSlug ?? (clinicFromBranch ? { id: clinicFromBranch.clinicId } : null) ?? (await prisma.clinic.findFirst({ select: { id: true } }));
  if (!clinic?.id) throw new Error("Clinic not found");

  let branchId = input.branchId;
  if (!branchId) {
    const branch = await prisma.branch.findFirst({ where: { clinicId: clinic.id }, select: { id: true } });
    branchId = branch?.id ?? "";
  }

  if (!branchId) throw new Error("Branch is required");

  const slots = await withTenantContext(
    { clinicId: clinic.id },
    () => getAvailability({ serviceId: input.serviceId, branchId, date: input.date }),
  );

  return slots.map((slot) => ({
    id: `${branchId}-${slot.time}`,
    time: slot.time,
    therapist: (slot as any).therapistName,
    resource: (slot as any).resourceName,
  }));
};
