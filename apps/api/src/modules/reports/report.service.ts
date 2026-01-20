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

export const getTopServices = async (start?: string, end?: string, limit = 10) => {
  const { clinicId } = assertTenant();
  const { startDate, endDate } = parseRange(start, end);

  const topServices = await prisma.reservation.groupBy({
    by: ["serviceId"],
    where: { 
      clinicId, 
      startAt: { gte: startDate, lte: endDate },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    _count: { serviceId: true },
    orderBy: { _count: { serviceId: "desc" } },
    take: limit,
  });

  const services = await prisma.service.findMany({
    where: { id: { in: topServices.map(s => s.serviceId) } },
    select: { id: true, name: true, price: true },
  });

  return topServices.map((ts) => {
    const service = services.find(s => s.id === ts.serviceId);
    return {
      serviceId: ts.serviceId,
      serviceName: service?.name ?? "Servicio eliminado",
      price: service?.price ?? 0,
      bookings: ts._count.serviceId,
      revenue: (service?.price ?? 0) * ts._count.serviceId,
    };
  });
};

export const getDashboardSummary = async (start?: string, end?: string) => {
  const { clinicId } = assertTenant();
  const { startDate, endDate } = parseRange(start, end);

  // Calculate previous period for comparison
  const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const previousStart = new Date(startDate);
  previousStart.setDate(previousStart.getDate() - periodDays);
  const previousEnd = new Date(startDate);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const [
    currentRevenue,
    previousRevenue,
    currentBookings,
    previousBookings,
    activeClients,
    activeMemberships,
  ] = await Promise.all([
    // Current period revenue
    prisma.paymentIntent.aggregate({
      where: { clinicId, createdAt: { gte: startDate, lte: endDate }, status: "PAID" },
      _sum: { amount: true },
    }),
    // Previous period revenue
    prisma.paymentIntent.aggregate({
      where: { clinicId, createdAt: { gte: previousStart, lte: previousEnd }, status: "PAID" },
      _sum: { amount: true },
    }),
    // Current bookings
    prisma.reservation.count({
      where: { clinicId, startAt: { gte: startDate, lte: endDate }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    // Previous bookings
    prisma.reservation.count({
      where: { clinicId, startAt: { gte: previousStart, lte: previousEnd }, status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    // Active clients (with reservations in period)
    prisma.user.count({
      where: { 
        clinicId, 
        role: "CLIENT",
        reservations: { some: { startAt: { gte: startDate, lte: endDate } } },
      },
    }),
    // Active memberships
    prisma.userMembership.count({
      where: { clinicId, status: "ACTIVE" },
    }),
  ]);

  const currentRev = currentRevenue._sum.amount ?? 0;
  const prevRev = previousRevenue._sum.amount ?? 0;
  const revenueChange = prevRev > 0 ? ((currentRev - prevRev) / prevRev) * 100 : 0;
  const bookingsChange = previousBookings > 0 ? ((currentBookings - previousBookings) / previousBookings) * 100 : 0;

  return {
    revenue: {
      current: currentRev,
      previous: prevRev,
      change: Math.round(revenueChange * 10) / 10,
    },
    bookings: {
      current: currentBookings,
      previous: previousBookings,
      change: Math.round(bookingsChange * 10) / 10,
    },
    activeClients,
    activeMemberships,
    range: { startDate, endDate },
  };
};
