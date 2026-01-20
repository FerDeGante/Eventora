import { prisma } from "../../lib/prisma";
import type { CreateClinicInput, UpdateClinicInput } from "./clinic.schema";

export const createClinic = async (data: CreateClinicInput) => {
  const clinic = await prisma.clinic.create({
    data: {
      name: data.name,
      slug: data.slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
  });
  return clinic;
};

export const getClinicBySlug = async (slug: string) => {
  return prisma.clinic.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
  });
};

export const getClinicById = async (id: string) => {
  return prisma.clinic.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      timezone: true,
      currency: true,
      phone: true,
      email: true,
      address: true,
      website: true,
      description: true,
      settings: true,
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateClinic = async (id: string, data: UpdateClinicInput) => {
  return prisma.clinic.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      timezone: true,
      currency: true,
      phone: true,
      email: true,
      address: true,
      website: true,
      description: true,
      settings: true,
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const listClinics = async () => {
  return prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
  });
};

export const listBranches = async (clinicId: string) => {
  return prisma.branch.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      address: true,
      timezone: true,
      phone: true,
    },
  });
};
