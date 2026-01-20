import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

export const listCashShifts = async () => {
  const { clinicId } = assertTenant();
  return prisma.cashShift.findMany({
    where: { clinicId },
    orderBy: { openedAt: "desc" },
    include: {
      branch: { select: { id: true, name: true } },
      openedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
      closedBy: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });
};

export const openCashShift = async (input: { branchId?: string; openingAmount?: number; notes?: string }, staffId?: string) => {
  const { clinicId } = assertTenant();
  if (input.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: input.branchId, clinicId } });
    if (!branch) throw new Error("Branch not found");
  }
  const existingOpen = await prisma.cashShift.findFirst({
    where: { clinicId, branchId: input.branchId ?? null, closedAt: null },
  });
  if (existingOpen) throw new Error("There is already an open shift for this branch");

  return prisma.cashShift.create({
    data: {
      clinicId,
      branchId: input.branchId,
      openingAmount: input.openingAmount ?? 0,
      notes: input.notes,
      openedById: staffId,
    },
  });
};

export const closeCashShift = async (input: { shiftId: string; closingAmount: number; notes?: string }, staffId?: string) => {
  const { clinicId } = assertTenant();
  const shift = await prisma.cashShift.findFirst({ where: { id: input.shiftId, clinicId, closedAt: null } });
  if (!shift) throw new Error("Open shift not found");
  return prisma.cashShift.update({
    where: { id: shift.id },
    data: {
      closingAmount: input.closingAmount,
      closedAt: new Date(),
      closedById: staffId,
      notes: input.notes ?? shift.notes,
    },
  });
};
