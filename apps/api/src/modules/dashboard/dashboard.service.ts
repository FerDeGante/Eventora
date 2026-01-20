import { addDays, startOfDay } from "date-fns";
import { prisma } from "../../lib/prisma";
import { formatCurrency, formatHourLabel } from "../../utils/format";
import { withResolvedTenant } from "../../utils/tenant-resolver";
import { listNotificationTemplates } from "../notifications/notificationTemplate.service";
import { listPosTickets } from "../pos/ticket.service";
import { assertTenant } from "../../utils/tenant";

export type DashboardOverview = {
  stats: { label: string; value: string; delta?: string }[];
  timeline: {
    id: string;
    time?: string;
    startAt?: string;
    patient: string;
    service: string;
    therapist?: string;
    branch?: string;
    status: "scheduled" | "checked_in" | "completed";
  }[];
  webhooks: { provider: string; status: string; lastEvent: string }[];
  notifications: { template: string; channel: string; status: string; schedule?: string }[];
  posQueue: { id: string; branch: string; total: string; status: string }[];
  fallback?: boolean;
};

const TEMPLATE_META: Record<
  string,
  { schedule?: string; triggers?: string[]; channels?: string[]; status?: string; description?: string }
> = {
  booking_confirmation: { schedule: "Inmediato", triggers: ["reservation.created"], channels: ["email", "whatsapp"], status: "active" },
  reminder_1_day: { schedule: "24h antes", triggers: ["reservation.reminder_24h"], channels: ["email", "whatsapp"], status: "active" },
  reminder_1_hour: { schedule: "1h antes", triggers: ["reservation.reminder_1h"], channels: ["sms", "push"], status: "active" },
  follow_up: { schedule: "12h después", triggers: ["reservation.follow_up"], channels: ["email"], status: "paused" },
  discount_offer: { schedule: "Campaña", triggers: ["campaign.manual"], channels: ["email"], status: "draft" },
  admin_new_reservation: { schedule: "Inmediato", triggers: ["reservation.created"], channels: ["email", "whatsapp"], status: "active" },
  password_reset: { schedule: "Inmediato", triggers: ["auth.password_reset"], channels: ["email"], status: "active" },
  two_factor_code: { schedule: "Inmediato", triggers: ["auth.2fa_challenge"], channels: ["email", "sms"], status: "active" },
};

const fallbackOverview: DashboardOverview = {
  stats: [
    { label: "Reservas hoy", value: "86", delta: "+14% vs ayer" },
    { label: "Ingreso proyectado", value: "$186,000.00", delta: "Stripe · POS" },
    { label: "Planes activos", value: "312", delta: "Paquetes Eventora+" },
  ],
  timeline: [
    {
      id: "RES-8721",
      time: "08:30",
      patient: "Sofía Núñez",
      service: "Sesión hidroterapia",
      therapist: "Camila R.",
      branch: "Polanco",
      status: "checked_in",
    },
    {
      id: "RES-8722",
      time: "09:15",
      patient: "Carlos López",
      service: "Fisioterapia deportiva",
      therapist: "Marco T.",
      branch: "Roma",
      status: "scheduled",
    },
    {
      id: "RES-8723",
      time: "10:00",
      patient: "Paulina Aguilar",
      service: "Spa - Drenaje linfático",
      therapist: "Abril S.",
      branch: "Coyoacán",
      status: "scheduled",
    },
    {
      id: "RES-8724",
      time: "11:30",
      patient: "Jorge Mejía",
      service: "Rehab post-operatoria",
      therapist: "Dr. Pérez",
      branch: "Polanco",
      status: "completed",
    },
  ],
  webhooks: [
    { provider: "Stripe", status: "operational", lastEvent: "payment_intent.succeeded · hace 4m" },
    { provider: "Resend", status: "scheduled", lastEvent: "Reserva exitosa · hace 2m" },
    { provider: "Mercado Pago", status: "standby", lastEvent: "pending configuration" },
  ],
  notifications: [
    { template: "Reserva exitosa", channel: "email", status: "activo", schedule: "Inmediato" },
    { template: "Recordatorio 24h", channel: "email + whatsapp", status: "activo", schedule: "24h antes" },
    { template: "Recordatorio 1h", channel: "sms", status: "activo", schedule: "1h antes" },
    { template: "Seguimiento Eventora+", channel: "email", status: "borrador" },
    { template: "Código de descuento", channel: "email", status: "activo" },
  ],
  posQueue: [
    { id: "POS-1029", branch: "Polanco", total: "$3,240 MXN", status: "impresora lista" },
    { id: "POS-1030", branch: "Roma", total: "$1,180 MXN", status: "cobrando" },
  ],
  fallback: true,
};

const statusDelta = (current: number, previous: number) => {
  if (!previous) return "+0% vs ayer";
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(0)}% vs ayer`;
};

const mapReservationStatus = (status: string): DashboardOverview["timeline"][number]["status"] => {
  if (status === "CHECKED_IN") return "checked_in";
  if (status === "COMPLETED") return "completed";
  return "scheduled";
};

export const getDashboardOverview = async (clinicId?: string): Promise<DashboardOverview> => {
  try {
    return await withResolvedTenant(clinicId, async () => {
      const { clinicId: resolvedClinicId } = assertTenant();
      const start = startOfDay(new Date());
      const end = addDays(start, 1);
      const yesterdayStart = addDays(start, -1);
      const yesterdayEnd = start;

      const [reservationsToday, reservationsYesterday, payments, packages, timeline, templates, posQueue, lastNotification] =
        await Promise.all([
          prisma.reservation.count({ where: { clinicId: resolvedClinicId, startAt: { gte: start, lt: end } } }),
          prisma.reservation.count({ where: { clinicId: resolvedClinicId, startAt: { gte: yesterdayStart, lt: yesterdayEnd } } }),
          prisma.paymentIntent.findMany({
            where: { clinicId: resolvedClinicId, createdAt: { gte: start, lt: end }, status: { in: ["PAID", "AUTHORIZED"] } },
            select: { amount: true, currency: true },
          }),
          prisma.userPackage.count({ where: { clinicId: resolvedClinicId, expiryDate: { gt: start } } }),
          prisma.reservation.findMany({
            where: { clinicId: resolvedClinicId, startAt: { gte: start, lt: end } },
            orderBy: { startAt: "asc" },
            take: 12,
            include: {
              user: { select: { name: true, email: true } },
              service: { select: { name: true } },
              branch: { select: { name: true } },
              therapist: {
                select: { staff: { select: { user: { select: { name: true } } } } },
              },
            },
          }),
          listNotificationTemplates(),
          listPosTickets(),
          prisma.notification.findFirst({ where: { clinicId: resolvedClinicId }, orderBy: { createdAt: "desc" } }),
        ]);

      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

      const stats: DashboardOverview["stats"] = [
        { label: "Reservas hoy", value: reservationsToday.toString(), delta: statusDelta(reservationsToday, reservationsYesterday) },
        { label: "Ingreso proyectado", value: formatCurrency(totalRevenue, payments[0]?.currency ?? "MXN"), delta: "Stripe · POS" },
        { label: "Planes activos", value: packages.toString(), delta: "Wallet Eventora" },
      ];

      const timelineEntries: DashboardOverview["timeline"] = timeline.map((res) => ({
        id: res.id,
        time: formatHourLabel(res.startAt),
        startAt: res.startAt.toISOString(),
        patient: res.user?.name ?? res.user?.email ?? "Paciente",
        service: res.service?.name ?? "Servicio",
        therapist: res.therapist?.staff?.user?.name ?? "",
        branch: res.branch?.name ?? "",
        status: mapReservationStatus(res.status),
      }));

      const notifications = templates.map((tpl) => {
        const meta = TEMPLATE_META[tpl.key] ?? {};
        const channels = meta.channels ?? ["email"];
        return {
          template: tpl.name,
          channel: channels.join(" + "),
          status: meta.status ?? "activo",
          schedule: meta.schedule,
        };
      });

      const lastResendEvent =
        lastNotification?.template ?? lastNotification?.channel
          ? `${lastNotification?.template} · ${lastNotification?.channel}`
          : "Sin envíos recientes";

      const webhooks: DashboardOverview["webhooks"] = [
        {
          provider: "Stripe",
          status: payments.length ? "operational" : "standby",
          lastEvent: payments.length ? "payment_intent.succeeded · hoy" : "Sin pagos hoy",
        },
        {
          provider: "Resend",
          status: templates.length ? "scheduled" : "draft",
          lastEvent: lastResendEvent,
        },
        {
          provider: "Mercado Pago",
          status: process.env.MERCADOPAGO_ACCESS_TOKEN ? "standby" : "pending",
          lastEvent: process.env.MERCADOPAGO_ACCESS_TOKEN ? "Cuenta conectada" : "Configurar cuenta",
        },
      ];

      return {
        stats,
        timeline: timelineEntries,
        webhooks,
        notifications,
        posQueue,
        fallback: false,
      };
    });
  } catch (error) {
    return fallbackOverview;
  }
};

export const getDashboardStats = async () => {
  const { clinicId } = assertTenant();
  
  const now = new Date();
  const startOfToday = startOfDay(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Reservas del mes actual
  const [
    reservationsThisMonth,
    reservationsLastMonth,
    reservationsToday,
    activeClients,
    activePackages,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.reservation.count({
      where: {
        clinicId,
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.reservation.count({
      where: {
        clinicId,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.reservation.count({
      where: {
        clinicId,
        startAt: { gte: startOfToday },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.user.count({
      where: {
        clinicId,
        role: "CLIENT",
      },
    }),
    prisma.userPackage.count({
      where: {
        clinicId,
        sessionsRemaining: { gt: 0 },
        expiryDate: { gte: now },
      },
    }),
    prisma.userPackage.aggregate({
      where: {
        clinicId,
        createdAt: { gte: startOfMonth },
      },
      _sum: {
        pricePaid: true,
      },
    }),
  ]);

  // Calcular tasa de crecimiento
  const reservationGrowth = reservationsLastMonth > 0
    ? ((reservationsThisMonth - reservationsLastMonth) / reservationsLastMonth) * 100
    : 0;

  // Top servicios del mes
  const topServices = await prisma.reservation.groupBy({
    by: ['serviceId'],
    where: {
      clinicId,
      createdAt: { gte: startOfMonth },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 5,
  });

  const servicesWithNames = await Promise.all(
    topServices.map(async (item) => {
      const service = await prisma.service.findUnique({
        where: { id: item.serviceId },
        select: { name: true },
      });
      return {
        name: service?.name || 'Unknown',
        count: item._count.id,
      };
    })
  );

  // Tasa de ocupación (asumiendo 8 horas x 6 días x 4 semanas = 192 slots por terapeuta)
  const therapistsCount = await prisma.therapistProfile.count({
    where: { 
      staff: { 
        user: { clinicId } 
      } 
    },
  });
  const totalSlotsAvailable = therapistsCount * 192;
  const occupancyRate = totalSlotsAvailable > 0
    ? (reservationsThisMonth / totalSlotsAvailable) * 100
    : 0;

  return {
    // Métricas principales
    totalRevenue: revenueThisMonth._sum.pricePaid || 0,
    reservationsToday,
    reservationsThisMonth,
    activeClients,
    activePackages,
    
    // Métricas de crecimiento
    reservationGrowth: Math.round(reservationGrowth * 10) / 10,
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    
    // Top servicios
    topServices: servicesWithNames,
    
    // Metadatos
    period: {
      from: startOfMonth.toISOString(),
      to: now.toISOString(),
    },
  };
};
