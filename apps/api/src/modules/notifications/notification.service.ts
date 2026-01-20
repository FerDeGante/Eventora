import { resend } from "../../lib/resend";
import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import type { SendEmailInput, NotificationQuery } from "./notification.schema";
import { resolveTemplateContent, ensureTemplatesForClinic } from "./notificationTemplate.service";

export const sendTransactionalEmail = async (input: SendEmailInput) => {
  const { clinicId, userId } = assertTenant();

  let subject = input.subject;
  let html = input.html;
  let text = input.text;

  if (input.template) {
    await ensureTemplatesForClinic(clinicId);
    const rendered = await resolveTemplateContent(clinicId, input.template, input.templateData);
    if (rendered) {
      subject = rendered.subject ?? subject;
      html = rendered.html ?? html;
      text = rendered.text ?? text;
    }
  }

  if (!html && !text) {
    throw new Error("Either html or text content is required");
  }

  if (!subject) {
    throw new Error("Subject is required");
  }

  const result = await resend.emails.send({
    from: "Eventora <notifications@mg.de-gante.com>",
    to: input.to,
    subject,
    html,
    text,
  } as any);

  await prisma.notification.create({
    data: {
      clinicId,
      userId,
      channel: "EMAIL",
      template: input.template ?? "custom",
      payload: {
        to: input.to,
        subject,
        data: input.templateData,
      },
      status: result.error ? "FAILED" : "SENT",
      sentAt: result.error ? undefined : new Date(),
      error: result.error?.message,
    },
  });

  if (result.error) {
    throw new Error(result.error.message ?? "Failed to send email");
  }

  return { id: result.data?.id }; 
};

export const listNotifications = async (query: NotificationQuery) => {
  const { clinicId } = assertTenant();
  const { page, limit, type, status, userId } = query;
  const skip = (page - 1) * limit;

  const where: any = { clinicId };
  if (type) where.channel = type;
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
