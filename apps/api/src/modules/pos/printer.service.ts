import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

export const listPrinters = async () => {
  const { clinicId } = assertTenant();
  return prisma.posPrinter.findMany({
    where: { clinicId },
    include: { terminal: { select: { id: true, name: true } } },
  });
};

export const createPrinter = async (input: { name: string; terminalId?: string; type?: string; connection?: string; metadata?: any }) => {
  const { clinicId } = assertTenant();
  if (input.terminalId) {
    const terminal = await prisma.posTerminal.findFirst({ where: { id: input.terminalId, clinicId } });
    if (!terminal) throw new Error("Terminal not found");
  }
  return prisma.posPrinter.create({
    data: {
      clinicId,
      name: input.name,
      terminalId: input.terminalId,
      type: input.type ?? "thermal",
      connection: input.connection ?? "network",
      metadata: input.metadata,
    },
  });
};

export const updatePrinter = async (id: string, input: { name?: string; terminalId?: string; status?: string; metadata?: any }) => {
  const { clinicId } = assertTenant();
  const printer = await prisma.posPrinter.findFirst({ where: { id, clinicId } });
  if (!printer) throw new Error("Printer not found");
  if (input.terminalId) {
    const terminal = await prisma.posTerminal.findFirst({ where: { id: input.terminalId, clinicId } });
    if (!terminal) throw new Error("Terminal not found");
  }
  return prisma.posPrinter.update({
    where: { id },
    data: {
      name: input.name ?? printer.name,
      terminalId: input.terminalId ?? printer.terminalId,
      status: input.status ?? printer.status,
      metadata: input.metadata ?? printer.metadata,
    },
  });
};

export const deletePrinter = async (id: string) => {
  const { clinicId } = assertTenant();
  await prisma.posPrinter.updateMany({ where: { id, clinicId }, data: { status: "INACTIVE" } });
};
