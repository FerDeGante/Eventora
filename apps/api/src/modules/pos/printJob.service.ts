import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

const formatTicket = (payment: any) => {
  const lines = [
    "Eventora",
    "--------------------------",
    `Monto: ${payment.amount} ${payment.currency}`,
    `Proveedor: ${payment.provider}`,
    payment.User ? `Cliente: ${payment.User?.name ?? payment.User?.email}` : "",
    payment.reservation ? `Servicio: ${payment.reservation.service?.name ?? ""}` : "",
    payment.reservation ? `Fecha: ${payment.reservation.startAt.toLocaleString()}` : "",
    new Date().toLocaleString(),
    "Gracias por tu reserva",
  ].filter(Boolean);
  return lines.join("\n");
};

export const enqueueTicketPrint = async (paymentIntentId: string, printerId?: string) => {
  const payment = await prisma.paymentIntent.findUnique({
    where: { id: paymentIntentId },
    include: {
      User: true,
      reservation: { include: { service: true } },
    },
  });
  if (!payment) return;
  await prisma.posPrintJob.create({
    data: {
      clinicId: payment.clinicId,
      printerId: printerId ?? null,
      paymentIntentId: payment.id,
      content: formatTicket(payment),
      metadata: { paymentIntentId: payment.id },
    },
  });
};

export const fetchNextPrintJob = async (printerId: string) => {
  const { clinicId } = assertTenant();
  const job = await prisma.posPrintJob.findFirst({
    where: { clinicId, printerId, status: "QUEUED" },
    orderBy: { createdAt: "asc" },
  });
  return job;
};

export const acknowledgePrintJob = async (jobId: string, success: boolean, error?: string) => {
  const { clinicId } = assertTenant();
  return prisma.posPrintJob.updateMany({
    where: { id: jobId, clinicId },
    data: {
      status: success ? "PRINTED" : "FAILED",
      processedAt: new Date(),
      error,
    },
  });
};
