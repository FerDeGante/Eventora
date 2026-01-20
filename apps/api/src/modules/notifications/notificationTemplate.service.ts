import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import { DEFAULT_NOTIFICATION_TEMPLATES } from "./templates.defaults";
import type { UpdateTemplateInput } from "./notification.schema";

const TEMPLATE_UNIQUE = (clinicId: string, key: string) => ({
  clinicId_key: {
    clinicId,
    key,
  },
});

const renderTemplateString = (content: string | null | undefined, data?: Record<string, any>) => {
  if (!content) return content ?? undefined;
  if (!data) return content;
  return content.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    const value = data[key];
    return value == null ? match : String(value);
  });
};

export const ensureTemplatesForClinic = async (clinicId: string) => {
  await Promise.all(
    DEFAULT_NOTIFICATION_TEMPLATES.map((tpl) =>
      prisma.notificationTemplate.upsert({
        where: TEMPLATE_UNIQUE(clinicId, tpl.key),
        create: {
          clinicId,
          key: tpl.key,
          name: tpl.name,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        },
        update: {},
      }),
    ),
  );
};

export const listNotificationTemplates = async () => {
  const { clinicId } = assertTenant();
  await ensureTemplatesForClinic(clinicId);
  return prisma.notificationTemplate.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
  });
};

export const getNotificationTemplate = async (idOrKey: string) => {
  const { clinicId } = assertTenant();
  await ensureTemplatesForClinic(clinicId);
  return prisma.notificationTemplate.findFirst({
    where: {
      clinicId,
      OR: [{ key: idOrKey }, { id: idOrKey }],
    },
  });
};

export const updateNotificationTemplate = async (idOrKey: string, input: UpdateTemplateInput) => {
  const { clinicId } = assertTenant();
  await ensureTemplatesForClinic(clinicId);
  const existing = await prisma.notificationTemplate.findFirst({
    where: { clinicId, OR: [{ key: idOrKey }, { id: idOrKey }] },
  });
  if (!existing) throw new Error("Template not found");
  const template = await prisma.notificationTemplate.update({
    where: { id: existing.id },
    data: {
      ...(input.subject ? { subject: input.subject } : {}),
      ...(input.html !== undefined ? { html: input.html } : {}),
      ...(input.text !== undefined ? { text: input.text } : {}),
      ...(input.name ? { name: input.name } : {}),
    },
  });
  return template;
};

export const resolveTemplateContent = async (
  clinicId: string,
  key: string,
  data?: Record<string, any>,
) => {
  await ensureTemplatesForClinic(clinicId);
  const template = await prisma.notificationTemplate.findUnique({
    where: TEMPLATE_UNIQUE(clinicId, key),
  });
  if (!template) return null;
  return {
    subject: renderTemplateString(template.subject, data) ?? undefined,
    html: renderTemplateString(template.html, data),
    text: renderTemplateString(template.text, data),
  };
};
