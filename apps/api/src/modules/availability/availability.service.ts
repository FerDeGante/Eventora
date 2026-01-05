import { addDays } from "date-fns";
import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import type { AvailabilityQuery, TemplateQuery, UpdateTemplateInput } from "./availability.schema";

const toMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();
const minutesToLabel = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const parseTimeString = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) throw new Error("Invalid time value");
  return new Date(Date.UTC(1970, 0, 1, h, m, 0, 0));
};

export const createAvailabilityTemplate = async (input: {
  ownerType: "BRANCH" | "SERVICE" | "THERAPIST" | "RESOURCE";
  ownerId: string;
  branchId?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  capacity: number;
}) => {
  const { clinicId } = assertTenant();

  if (input.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: input.branchId, clinicId } });
    if (!branch) throw new Error("Branch not found");
  }

  const start = parseTimeString(input.startTime);
  const end = parseTimeString(input.endTime);

  return prisma.availabilityTemplate.create({
    data: {
      clinicId,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      branchId: input.branchId,
      weekday: input.weekday,
      startTime: start,
      endTime: end,
      slotDuration: input.slotDuration,
      capacity: input.capacity,
    },
  });
};

export const getAvailability = async (params: AvailabilityQuery) => {
  const { clinicId } = assertTenant();
  const targetDate = new Date(`${params.date}T00:00:00.000Z`);
  if (Number.isNaN(targetDate.getTime())) throw new Error("Invalid date");
  const weekday = targetDate.getUTCDay();

  const exceptions = await prisma.availabilityException.findMany({
    where: {
      clinicId,
      date: targetDate,
      AND: {
        OR: [
          { ownerType: "BRANCH", ownerId: params.branchId },
          { ownerType: "SERVICE", ownerId: params.serviceId },
        ],
      },
    },
  });

  if (exceptions.some((ex) => ex.closed)) {
    return [];
  }

  const replacements = exceptions.find((ex) => Array.isArray(ex.replacementSlots));
  if (replacements) {
    return (replacements.replacementSlots as string[]).map((time) => ({ time, capacity: 1 }));
  }

  const templates = await prisma.availabilityTemplate.findMany({
    where: {
      clinicId,
      weekday,
      ownerType: { in: ["BRANCH", "SERVICE"] },
      ownerId: { in: [params.branchId, params.serviceId] },
    },
  });

  if (templates.length === 0) {
    return [];
  }

  const slotMap = new Map<string, { time: string; capacity: number }>();
  for (const template of templates) {
    const start = toMinutes(template.startTime);
    const end = toMinutes(template.endTime);
    const duration = template.slotDuration;
    for (let minutes = start; minutes + duration <= end; minutes += duration) {
      const label = minutesToLabel(minutes);
      const entry = slotMap.get(label);
      if (entry) {
        entry.capacity += template.capacity;
      } else {
        slotMap.set(label, { time: label, capacity: template.capacity });
      }
    }
  }

  const dayStart = targetDate;
  const dayEnd = addDays(dayStart, 1);

  const reservations = await prisma.reservation.findMany({
    where: {
      clinicId,
      branchId: params.branchId,
      serviceId: params.serviceId,
      startAt: { gte: dayStart, lt: dayEnd },
    },
    select: { startAt: true },
  });

  const takenCount = new Map<string, number>();
  reservations.forEach((res) => {
    const label = res.startAt.toISOString().slice(11, 16);
    takenCount.set(label, (takenCount.get(label) ?? 0) + 1);
  });

  const available = Array.from(slotMap.values())
    .map((slot) => {
      const remaining = slot.capacity - (takenCount.get(slot.time) ?? 0);
      return { ...slot, capacity: remaining };
    })
    .filter((slot) => slot.capacity > 0)
    .sort((a, b) => (a.time < b.time ? -1 : 1));

  return available;
};

export const listTemplates = async (query: TemplateQuery) => {
  const { clinicId } = assertTenant();
  const where: any = { clinicId };
  if (query.ownerType) where.ownerType = query.ownerType;
  if (query.ownerId) where.ownerId = query.ownerId;
  if (query.branchId) where.branchId = query.branchId;

  return prisma.availabilityTemplate.findMany({
    where,
    orderBy: { weekday: "asc" },
  });
};

export const getTemplateById = async (id: string) => {
  const { clinicId } = assertTenant();
  const template = await prisma.availabilityTemplate.findUnique({
    where: { id },
  });

  if (!template || template.clinicId !== clinicId) {
    throw new Error("Template not found");
  }

  return template;
};

export const updateTemplate = async (id: string, input: UpdateTemplateInput) => {
  const { clinicId } = assertTenant();
  const template = await prisma.availabilityTemplate.findUnique({
    where: { id },
  });

  if (!template || template.clinicId !== clinicId) {
    throw new Error("Template not found");
  }

  const data: any = { ...input };
  if (input.startTime) data.startTime = parseTimeString(input.startTime);
  if (input.endTime) data.endTime = parseTimeString(input.endTime);

  return prisma.availabilityTemplate.update({
    where: { id },
    data,
  });
};

export const deleteTemplate = async (id: string) => {
  const { clinicId } = assertTenant();
  const template = await prisma.availabilityTemplate.findUnique({
    where: { id },
  });

  if (!template || template.clinicId !== clinicId) {
    throw new Error("Template not found");
  }

  return prisma.availabilityTemplate.delete({
    where: { id },
  });
};
