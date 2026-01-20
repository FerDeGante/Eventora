import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import { toPagination } from "../../utils/pagination";
import type { 
  CreateReservationInput, 
  ListReservationsQuery,
  UpdateReservationInput,
  UpdateReservationStatusInput
} from "./reservation.schema";
import { scheduleReservationReminders, notifyAdminsOfReservation } from "../notifications/notificationScheduler.service";

export const createReservation = async (input: CreateReservationInput) => {
  const { clinicId } = assertTenant();

  const [service, branch] = await Promise.all([
    prisma.service.findFirst({ where: { id: input.serviceId, clinicId } }),
    prisma.branch.findFirst({ where: { id: input.branchId, clinicId } }),
  ]);

  if (!service) throw new Error("Service not found");
  if (!branch) throw new Error("Branch not found");

  // Resolve or create user
  let userId: string;
  if (input.userId) {
    const user = await prisma.user.findFirst({ where: { id: input.userId, clinicId } });
    if (!user) throw new Error("User not found");
    userId = user.id;
  } else if (input.clientEmail && input.clientName) {
    // Find or create user by email
    let user = await prisma.user.findFirst({ where: { email: input.clientEmail, clinicId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clinicId,
          email: input.clientEmail,
          name: input.clientName,
          phone: input.clientPhone || null,
          role: "CLIENT",
        },
      });
    }
    userId = user.id;
  } else {
    throw new Error("Either userId or (clientName + clientEmail) must be provided");
  }

  const duration = input.durationMinutes ?? service.defaultDuration;
  const startAt = input.startAt;
  const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

  if (input.resourceId) {
    const resource = await prisma.resource.findFirst({
      where: { id: input.resourceId, clinicId },
    });
    if (!resource) {
      throw new Error("Resource not found");
    }
  }

  const overlapping = await prisma.reservation.findFirst({
    where: {
      clinicId,
      branchId: input.branchId,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(input.resourceId ? { resourceId: input.resourceId } : {}),
    },
  });

  if (overlapping) {
    throw new Error("Slot already taken");
  }

  const userPackage = input.userPackageId
    ? await prisma.userPackage.findFirst({
        where: { id: input.userPackageId, clinicId, userId },
      })
    : null;

  const reservation = await prisma.$transaction(async (tx) => {
    if (userPackage) {
      if (userPackage.sessionsRemaining <= 0) {
        throw new Error("Package has no remaining sessions");
      }

      await tx.userPackage.update({
        where: { id: userPackage.id },
        data: { sessionsRemaining: { decrement: 1 } },
      });
    }

    return tx.reservation.create({
      data: {
        clinicId,
        branchId: input.branchId,
        serviceId: input.serviceId,
        userId,
        therapistId: input.therapistId,
        resourceId: input.resourceId,
        packageId: userPackage?.packageId,
        userPackageId: userPackage?.id,
        startAt,
        endAt,
        status: "CONFIRMED",
        paymentStatus: "UNPAID",
        notes: input.notes,
      },
      include: {
        service: true,
        branch: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  });

  await notifyAdminsOfReservation(reservation);
  await scheduleReservationReminders(reservation);

  return reservation;
};

export const listReservations = async (params: ListReservationsQuery) => {
  const { clinicId } = assertTenant();
  const { skip, take } = toPagination({ page: params.page, pageSize: params.pageSize });
  return prisma.reservation.findMany({
    where: {
      clinicId,
      ...(params.start && { startAt: { gte: params.start } }),
      ...(params.end && { endAt: { lte: params.end } }),
    },
    orderBy: { startAt: "asc" },
    skip,
    take,
    include: {
      service: true,
      branch: true,
      user: { select: { id: true, name: true, email: true } },
      therapist: {
        select: {
          id: true,
          staff: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });
};

export const getReservationById = async (id: string) => {
  const { clinicId } = assertTenant();
  
  const reservation = await prisma.reservation.findFirst({
    where: { id, clinicId },
    include: {
      service: true,
      branch: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      therapist: {
        select: {
          id: true,
          staff: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
      },
      userPackage: {
        include: {
          package: true,
        },
      },
    },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  return reservation;
};

export const updateReservation = async (id: string, input: UpdateReservationInput) => {
  const { clinicId } = assertTenant();

  const existing = await prisma.reservation.findFirst({
    where: { id, clinicId },
  });

  if (!existing) {
    throw new Error("Reservation not found");
  }

  // Si se está cambiando la hora, verificar disponibilidad
  if (input.startAt || input.durationMinutes) {
    const startAt = input.startAt ?? existing.startAt;
    const duration = input.durationMinutes ?? (existing.endAt.getTime() - existing.startAt.getTime()) / (60 * 1000);
    const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

    const overlapping = await prisma.reservation.findFirst({
      where: {
        clinicId,
        id: { not: id },
        branchId: existing.branchId,
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(existing.resourceId ? { resourceId: existing.resourceId } : {}),
      },
    });

    if (overlapping) {
      throw new Error("Slot already taken");
    }
  }

  const updateData: any = {
    ...input,
  };

  // Calcular nuevo endAt si cambia startAt o duration
  if (input.startAt || input.durationMinutes) {
    const startAt = input.startAt ?? existing.startAt;
    const duration = input.durationMinutes ?? (existing.endAt.getTime() - existing.startAt.getTime()) / (60 * 1000);
    updateData.endAt = new Date(startAt.getTime() + duration * 60 * 1000);
  }

  return prisma.reservation.update({
    where: { id },
    data: updateData,
    include: {
      service: true,
      branch: true,
      user: { select: { id: true, name: true, email: true } },
      therapist: {
        select: {
          id: true,
          staff: {
            select: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });
};

export const updateReservationStatus = async (id: string, input: UpdateReservationStatusInput) => {
  const { clinicId } = assertTenant();

  const existing = await prisma.reservation.findFirst({
    where: { id, clinicId },
  });

  if (!existing) {
    throw new Error("Reservation not found");
  }

  // Si se cancela y había un paquete, devolver la sesión
  if (input.status === "CANCELLED" && existing.userPackageId) {
    await prisma.userPackage.update({
      where: { id: existing.userPackageId },
      data: { sessionsRemaining: { increment: 1 } },
    });
  }

  return prisma.reservation.update({
    where: { id },
    data: { status: input.status },
    include: {
      service: true,
      branch: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

export const deleteReservation = async (id: string) => {
  const { clinicId } = assertTenant();

  const existing = await prisma.reservation.findFirst({
    where: { id, clinicId },
    include: { userPackage: true },
  });

  if (!existing) {
    throw new Error("Reservation not found");
  }

  // Si tenía paquete, devolver la sesión
  if (existing.userPackageId) {
    await prisma.userPackage.update({
      where: { id: existing.userPackageId },
      data: { sessionsRemaining: { increment: 1 } },
    });
  }

  await prisma.reservation.delete({
    where: { id },
  });

  return { success: true };
};
