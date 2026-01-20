import { subHours, subDays, subMinutes, addHours } from "date-fns";
import { prisma } from "../../lib/prisma";
import { resend } from "../../lib/resend";
import { ensureTemplatesForClinic, resolveTemplateContent } from "./notificationTemplate.service";

type RecipientPayload = {
  to: string[];
  data?: Record<string, any>;
};

const createQueuedNotification = async (
  clinicId: string,
  payload: RecipientPayload,
  template: string,
  scheduledAt: Date,
  userId?: string,
) => {
  if (!payload.to || payload.to.length === 0) return null;
  // Avoid scheduling notifications in the past
  if (scheduledAt <= new Date()) return null;
  
  // Check for duplicates
  const existing = await prisma.notification.findFirst({
    where: {
      clinicId,
      userId,
      template,
      status: { in: ["QUEUED", "SENT"] },
      scheduledAt: {
        gte: subMinutes(scheduledAt, 5),
        lte: addHours(scheduledAt, 1),
      },
    },
  });
  if (existing) return null;
  
  return prisma.notification.create({
    data: {
      clinicId,
      userId,
      channel: "EMAIL",
      template,
      payload,
      scheduledAt,
      status: "QUEUED",
    },
  });
};

const buildReservationData = (reservation: any) => ({
  name: reservation.user?.name ?? reservation.user?.email ?? "Cliente",
  service: reservation.service?.name ?? "Servicio",
  branch: reservation.branch?.name ?? "",
  date: reservation.startAt.toLocaleDateString("es-MX", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  }),
  time: reservation.startAt.toLocaleTimeString("es-MX", { 
    hour: "2-digit", 
    minute: "2-digit" 
  }),
  bookingLink: `https://eventora.com.mx/book/${reservation.clinicId}`,
  calendarLink: reservation.bookingLink ?? "",
  unsubscribeLink: `https://eventora.com.mx/unsubscribe?id=${reservation.userId}`,
});

export const scheduleReservationReminders = async (reservation: any) => {
  const { clinicId } = reservation;
  const userEmail = reservation.user?.email;
  if (!userEmail) return;

  const data = buildReservationData(reservation);

  // 1 day before
  const oneDayBefore = subDays(reservation.startAt, 1);
  await createQueuedNotification(clinicId, { to: [userEmail], data }, "reminder_1_day", oneDayBefore, reservation.userId);

  // 1 hour before
  const oneHourBefore = subHours(reservation.startAt, 1);
  await createQueuedNotification(clinicId, { to: [userEmail], data }, "reminder_1_hour", oneHourBefore, reservation.userId);

  // 15 minutes before
  const fifteenMinBefore = subMinutes(reservation.startAt, 15);
  await createQueuedNotification(clinicId, { to: [userEmail], data }, "reminder_15_min", fifteenMinBefore, reservation.userId);
};

export const scheduleFollowUp = async (reservation: any) => {
  const { clinicId } = reservation;
  const userEmail = reservation.user?.email;
  if (!userEmail) return;

  const data = buildReservationData(reservation);
  
  // Send follow-up 2 hours after appointment end
  const followUpTime = addHours(reservation.endAt, 2);
  await createQueuedNotification(clinicId, { to: [userEmail], data }, "follow_up", followUpTime, reservation.userId);
};

export const sendBookingConfirmation = async (reservation: any) => {
  const userEmail = reservation.user?.email;
  if (!userEmail) return;

  await ensureTemplatesForClinic(reservation.clinicId);
  const data = buildReservationData(reservation);
  const rendered = await resolveTemplateContent(reservation.clinicId, "booking_confirmation", data);
  
  await resend.emails.send({
    from: "Eventora <notifications@eventora.com.mx>",
    to: [userEmail],
    subject: rendered?.subject ?? "Tu cita está confirmada",
    html: rendered?.html,
    text: rendered?.text,
  } as any);
};

export const sendCancellationConfirmation = async (reservation: any) => {
  const userEmail = reservation.user?.email;
  if (!userEmail) return;

  await ensureTemplatesForClinic(reservation.clinicId);
  const data = buildReservationData(reservation);
  const rendered = await resolveTemplateContent(reservation.clinicId, "cancellation_confirmation", data);
  
  await resend.emails.send({
    from: "Eventora <notifications@eventora.com.mx>",
    to: [userEmail],
    subject: rendered?.subject ?? "Tu cita ha sido cancelada",
    html: rendered?.html,
    text: rendered?.text,
  } as any);
  
  // Cancel pending reminders
  await prisma.notification.updateMany({
    where: {
      userId: reservation.userId,
      clinicId: reservation.clinicId,
      template: { in: ["reminder_1_day", "reminder_1_hour", "reminder_15_min"] },
      status: "QUEUED",
    },
    data: { status: "CANCELLED" },
  });
};

export const sendNoShowNotification = async (reservation: any) => {
  const userEmail = reservation.user?.email;
  if (!userEmail) return;

  await ensureTemplatesForClinic(reservation.clinicId);
  const data = buildReservationData(reservation);
  const rendered = await resolveTemplateContent(reservation.clinicId, "no_show", data);
  
  await resend.emails.send({
    from: "Eventora <notifications@eventora.com.mx>",
    to: [userEmail],
    subject: rendered?.subject ?? "Te perdimos hoy",
    html: rendered?.html,
    text: rendered?.text,
  } as any);
};

export const notifyAdminsOfReservation = async (reservation: any) => {
  const admins = await prisma.user.findMany({
    where: {
      clinicId: reservation.clinicId,
      role: { in: ["ADMIN", "MANAGER", "RECEPTION"] },
      status: "ACTIVE",
    },
    select: { email: true },
  });
  const emails = admins.map((a) => a.email).filter(Boolean) as string[];
  if (emails.length === 0) return;
  await resend.emails.send({
    from: "Eventora <notifications@mg.de-gante.com>",
    to: emails,
    subject: `Nueva reservación: ${reservation.service?.name ?? "Servicio"}`,
    html: `
      <p>Cliente: ${reservation.user?.name ?? reservation.user?.email}</p>
      <p>Servicio: ${reservation.service?.name}</p>
      <p>Fecha: ${reservation.startAt.toLocaleString()}</p>
      <p>Sucursal: ${reservation.branch?.name ?? ""}</p>
    `,
  } as any);
};

const sendQueuedNotification = async (notification: any) => {
  const payload = notification.payload as RecipientPayload;
  const to = payload.to || [];
  if (to.length === 0) throw new Error("No recipients");

  await ensureTemplatesForClinic(notification.clinicId);
  const rendered = await resolveTemplateContent(notification.clinicId, notification.template, payload.data);
  const subject = rendered?.subject ?? payload.data?.subject ?? "Notificación";
  const html = rendered?.html;
  const text = rendered?.text;

  await resend.emails.send({
    from: "Eventora <notifications@mg.de-gante.com>",
    to,
    subject,
    html,
    text,
  } as any);

  await prisma.notification.update({
    where: { id: notification.id },
    data: { status: "SENT", sentAt: new Date() },
  });
};

export const processDueNotifications = async () => {
  const now = new Date();
  const notifications = await prisma.notification.findMany({
    where: {
      status: "QUEUED",
      channel: "EMAIL",
      scheduledAt: { lte: now },
    },
    take: 50,
  });

  const results = [];
  for (const notification of notifications) {
    try {
      await sendQueuedNotification(notification);
      results.push({ id: notification.id, status: "SENT" });
    } catch (error: any) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: "FAILED", error: error.message },
      });
      results.push({ id: notification.id, status: "FAILED", error: error.message });
    }
  }
  return results;
};
