import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import { formatCurrency } from "../../utils/format";
import { enqueueTicketPrint } from "./printJob.service";

export type PosTicketSummary = { id: string; branch: string; branchId?: string; total: string; status: string };

export const listPosTickets = async (): Promise<PosTicketSummary[]> => {
  const { clinicId } = assertTenant();
  const jobs = await prisma.posPrintJob.findMany({
    where: { clinicId },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      printer: {
        select: {
          id: true,
          name: true,
          terminal: { select: { branchId: true, branch: { select: { id: true, name: true } } } },
        },
      },
      paymentIntent: true,
    },
  });

  if (!jobs.length) {
    return [
      { id: "POS-DEMO-1", branch: "Eventora Polanco", total: "$3,240.00 MXN", status: "Impresora lista" },
      { id: "POS-DEMO-2", branch: "Eventora Roma", total: "$1,180.00 MXN", status: "Enviando a Epson TM-T88" },
    ];
  }

  return jobs.map((job) => {
    const payment = job.paymentIntent;
    const amount = payment?.amount ?? 0;
    const currency = payment?.currency ?? "MXN";
    const branchId = job.printer?.terminal?.branch?.id ?? job.printer?.terminal?.branchId ?? undefined;
    const branchName =
      job.printer?.terminal?.branch?.name ??
      job.printer?.name ??
      (payment?.metadata as any)?.branchName ??
      "POS";
    let status = "En cola";
    if (job.status === "PRINTED") status = "Impreso";
    if (job.status === "FAILED") status = "Error";
    const total = payment ? formatCurrency(amount, currency) : "Ticket";
    return {
      id: job.paymentIntentId ?? job.id,
      branch: branchName,
      branchId,
      total,
      status,
    };
  });
};

export const reprintTicket = async (ticketId: string) => {
  const { clinicId } = assertTenant();
  const job = await prisma.posPrintJob.findFirst({
    where: { clinicId, OR: [{ id: ticketId }, { paymentIntentId: ticketId }] },
  });
  const paymentIntentId = job?.paymentIntentId ?? ticketId;
  await enqueueTicketPrint(paymentIntentId);
  return { ok: true };
};

export const enqueueDemoTicket = async () => {
  const { clinicId } = assertTenant();
  const printer = await prisma.posPrinter.findFirst({ where: { clinicId }, select: { id: true } });
  await prisma.posPrintJob.create({
    data: {
      clinicId,
      printerId: printer?.id ?? null,
      content: "Eventora Demo Ticket\n------------------\nPOS listo para imprimir.",
      metadata: { demo: true },
    },
  });
  return { ok: true };
};

export const closeBranchShift = async (branchId: string) => {
  const { clinicId, userId } = assertTenant();
  const branch = await prisma.branch.findFirst({
    where: { clinicId, OR: [{ id: branchId }, { name: branchId }] },
    select: { id: true },
  });
  const targetBranchId = branch?.id ?? branchId;
  const openShift = await prisma.cashShift.findFirst({
    where: { clinicId, branchId: targetBranchId, closedAt: null },
    orderBy: { openedAt: "desc" },
  });
  if (!openShift) {
    throw new Error("No hay turno abierto para esta sucursal");
  }

  const staff = userId
    ? await prisma.staff.findFirst({ where: { userId }, select: { id: true } })
    : null;

  await prisma.cashShift.update({
    where: { id: openShift.id },
    data: {
      closedAt: new Date(),
      closingAmount: openShift.closingAmount ?? openShift.openingAmount,
      closedById: staff?.id,
    },
  });

  return { ok: true, shiftId: openShift.id };
};
