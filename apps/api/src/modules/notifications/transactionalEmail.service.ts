/**
 * Eventora Transactional Email Service
 * 
 * Centraliza el envío de emails automáticos para flujos críticos.
 * Usa templates de notificationTemplate.service.ts
 */

import { resend } from "../../lib/resend";
import { prisma } from "../../lib/prisma";
import { ensureTemplatesForClinic, resolveTemplateContent } from "./notificationTemplate.service";
import { logger } from "../../lib/logger";

const FROM_EMAIL = "Eventora <notifications@mg.de-gante.com>";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía email usando template y registra en notifications
 */
async function sendTemplateEmail(
  clinicId: string,
  to: string,
  templateKey: string,
  data: Record<string, any>,
  userId?: string
): Promise<EmailResult> {
  try {
    await ensureTemplatesForClinic(clinicId);
    const rendered = await resolveTemplateContent(clinicId, templateKey, data);
    
    if (!rendered || !rendered.subject) {
      logger.warn({ clinicId, templateKey }, "Template not found or invalid");
      return { success: false, error: "Template not found" };
    }

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    } as any);

    // Registrar en BD
    await prisma.notification.create({
      data: {
        clinicId,
        userId,
        channel: "EMAIL",
        template: templateKey,
        payload: { to, data },
        status: result.error ? "FAILED" : "SENT",
        sentAt: result.error ? undefined : new Date(),
        error: result.error?.message,
      },
    });

    if (result.error) {
      logger.error({ clinicId, templateKey, error: result.error }, "Email send failed");
      return { success: false, error: result.error.message };
    }

    logger.info({ clinicId, templateKey, to }, "Transactional email sent");
    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    logger.error({ clinicId, templateKey, error: error.message }, "Email service error");
    return { success: false, error: error.message };
  }
}

// ============================================
// WORKSPACE EMAILS (B2B)
// ============================================

/**
 * Envía email de bienvenida cuando se crea un nuevo workspace
 */
export async function sendWorkspaceWelcomeEmail(
  clinicId: string,
  ownerEmail: string,
  data: {
    name: string;
    workspaceName: string;
    slug: string;
    trialDays?: number;
  }
) {
  const baseUrl = process.env.APP_URL || "https://eventora.mx";
  return sendTemplateEmail(clinicId, ownerEmail, "workspace_welcome", {
    ...data,
    trialDays: data.trialDays ?? 14,
    dashboardLink: `${baseUrl}/dashboard`,
  });
}

// ============================================
// BOOKING EMAILS (B2C)
// ============================================

/**
 * Envía confirmación de reservación al cliente
 */
export async function sendBookingConfirmationEmail(
  clinicId: string,
  clientEmail: string,
  userId: string,
  data: {
    name: string;
    service: string;
    date: string;
    time: string;
    branch: string;
    calendarLink?: string;
  }
) {
  const baseUrl = process.env.APP_URL || "https://eventora.mx";
  return sendTemplateEmail(clinicId, clientEmail, "booking_confirmation", {
    ...data,
    bookingLink: `${baseUrl}/my-bookings`,
    calendarLink: data.calendarLink || "",
    unsubscribeLink: `${baseUrl}/unsubscribe?id=${userId}`,
  }, userId);
}

/**
 * Envía confirmación de cancelación
 */
export async function sendCancellationEmail(
  clinicId: string,
  clientEmail: string,
  userId: string,
  data: {
    name: string;
    service: string;
    date: string;
    time: string;
  }
) {
  const baseUrl = process.env.APP_URL || "https://eventora.mx";
  return sendTemplateEmail(clinicId, clientEmail, "cancellation_confirmation", {
    ...data,
    bookingLink: `${baseUrl}/book`,
  }, userId);
}

/**
 * Envía confirmación de reagendamiento
 */
export async function sendRescheduleEmail(
  clinicId: string,
  clientEmail: string,
  userId: string,
  data: {
    name: string;
    service: string;
    oldDate: string;
    oldTime: string;
    date: string;
    time: string;
    calendarLink?: string;
  }
) {
  return sendTemplateEmail(clinicId, clientEmail, "reschedule_confirmation", {
    ...data,
    calendarLink: data.calendarLink || "",
  }, userId);
}

// ============================================
// PAYMENT EMAILS
// ============================================

/**
 * Envía confirmación de pago
 */
export async function sendPaymentConfirmationEmail(
  clinicId: string,
  clientEmail: string,
  userId: string,
  data: {
    name: string;
    amount: string;
    currency: string;
    description: string;
    paymentId: string;
    date: string;
  }
) {
  return sendTemplateEmail(clinicId, clientEmail, "payment_confirmation", data, userId);
}

// ============================================
// MEMBERSHIP EMAILS
// ============================================

/**
 * Envía confirmación de activación de membresía
 */
export async function sendMembershipActivatedEmail(
  clinicId: string,
  clientEmail: string,
  userId: string,
  data: {
    name: string;
    membershipName: string;
    membershipType: string;
    expiresAt: string;
    benefits: string;
  }
) {
  const baseUrl = process.env.APP_URL || "https://eventora.mx";
  return sendTemplateEmail(clinicId, clientEmail, "membership_activated", {
    ...data,
    bookingLink: `${baseUrl}/book`,
  }, userId);
}

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

/**
 * Notifica al admin sobre nueva reservación
 */
export async function sendAdminNewReservationEmail(
  clinicId: string,
  adminEmail: string,
  data: {
    name: string;
    service: string;
    date: string;
    time: string;
    branch: string;
  }
) {
  const baseUrl = process.env.APP_URL || "https://eventora.mx";
  return sendTemplateEmail(clinicId, adminEmail, "admin_new_reservation", {
    ...data,
    adminLink: `${baseUrl}/calendar`,
  });
}
