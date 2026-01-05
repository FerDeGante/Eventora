import { prisma } from "../../lib/prisma";
import type { CreateClinicInput } from "./clinic.schema";

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
