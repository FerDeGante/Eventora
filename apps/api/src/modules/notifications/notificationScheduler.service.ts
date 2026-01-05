import { subHours, subDays } from "date-fns";
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

export const scheduleReservationReminders = async (reservation: any) => {
  const { clinicId } = reservation;
  const userEmail = reservation.user?.email;
  if (!userEmail) return;

  const data = {
    name: reservation.user?.name ?? reservation.user?.email,
    service: reservation.service?.name ?? "",
    branch: reservation.branch?.name ?? "",
    date: reservation.startAt.toLocaleDateString(),
    time: reservation.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    bookingLink: reservation.bookingLink ?? "",
  };

  const oneDayBefore = subDays(reservation.startAt, 1);
  if (oneDayBefore > new Date()) {
    await createQueuedNotification(clinicId, { to: [userEmail], data }, "reminder_1_day", oneDayBefore, reservation.userId);
  }

  const oneHourBefore = subHours(reservation.startAt, 1);
  if (oneHourBefore > new Date()) {
    await createQueuedNotification(clinicId, { to: [userEmail], data }, "reminder_1_hour", oneHourBefore, reservation.userId);
  }
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
