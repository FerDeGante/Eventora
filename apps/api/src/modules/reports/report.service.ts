import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";

const parseRange = (start?: string, end?: string) => {
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(now.getDate() - 30);
  return {
    startDate: start ? new Date(start) : defaultStart,
    endDate: end ? new Date(end) : now,
  };
};

export const getFinancialOverview = async (start?: string, end?: string) => {
  const { clinicId } = assertTenant();
  const { startDate, endDate } = parseRange(start, end);

  const [payments, reservations] = await Promise.all([
    prisma.paymentIntent.findMany({
      where: { clinicId, createdAt: { gte: startDate, lte: endDate }, status: "PAID" },
      select: { amount: true, provider: true },
    }),
    prisma.reservation.count({
      where: { clinicId, startAt: { gte: startDate, lte: endDate }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const byProvider = payments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.provider] = (acc[payment.provider] ?? 0) + payment.amount;
    return acc;
  }, {});

  return {
    totalRevenue,
    payments: byProvider,
    reservations,
    range: { startDate, endDate },
  };
};

export const getOccupancyStats = async (start?: string, end?: string) => {
  const { clinicId } = assertTenant();
  const { startDate, endDate } = parseRange(start, end);

  const reservations = await prisma.reservation.groupBy({
    by: ["branchId"],
    where: { clinicId, startAt: { gte: startDate, lte: endDate } },
    _count: { branchId: true },
  });

  const branches = await prisma.branch.findMany({ where: { clinicId }, select: { id: true, name: true } });

  return branches.map((branch) => ({
    branchId: branch.id,
    branchName: branch.name,
    reservations: reservations.find((r) => r.branchId === branch.id)?._count.branchId ?? 0,
  }));
};
