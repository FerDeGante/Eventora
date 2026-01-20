import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

export const listTerminals = async () => {
  const { clinicId } = assertTenant();
  return prisma.posTerminal.findMany({
    where: { clinicId },
    include: { branch: { select: { id: true, name: true } } },
  });
};

export const createTerminal = async (input: { name: string; branchId?: string; type?: string; metadata?: any }) => {
  const { clinicId } = assertTenant();
  if (input.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: input.branchId, clinicId } });
    if (!branch) throw new Error("Branch not found");
  }
  return prisma.posTerminal.create({
    data: {
      clinicId,
      name: input.name,
      branchId: input.branchId,
      type: input.type ?? "terminal",
      metadata: input.metadata,
    },
  });
};

export const updateTerminal = async (id: string, input: { name?: string; branchId?: string; status?: string; metadata?: any }) => {
  const { clinicId } = assertTenant();
  const terminal = await prisma.posTerminal.findFirst({ where: { id, clinicId } });
  if (!terminal) throw new Error("Terminal not found");
  if (input.branchId) {
    const branch = await prisma.branch.findFirst({ where: { id: input.branchId, clinicId } });
    if (!branch) throw new Error("Branch not found");
  }
  return prisma.posTerminal.update({
    where: { id },
    data: {
      name: input.name ?? terminal.name,
      branchId: input.branchId ?? terminal.branchId,
      status: input.status ?? terminal.status,
      metadata: input.metadata ?? terminal.metadata,
    },
  });
};

export const deleteTerminal = async (id: string) => {
  const { clinicId } = assertTenant();
  await prisma.posTerminal.updateMany({ where: { id, clinicId }, data: { status: "INACTIVE" } });
};
