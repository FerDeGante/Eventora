import { z } from "zod";

export const sendEmailInput = z.object({
  to: z.array(z.string().email()).nonempty(),
  subject: z.string().min(1).optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  template: z.string().optional(),
  templateData: z.record(z.any()).optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailInput>;

export const updateTemplateInput = z.object({
  subject: z.string().min(1).optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  name: z.string().optional(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateInput>;

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
  type: z.enum(["EMAIL", "SMS", "WHATSAPP"]).optional(),
  status: z.enum(["PENDING", "SENT", "FAILED"]).optional(),
  userId: z.string().optional(),
});

export const templateQuerySchema = z.object({
  type: z.enum(["EMAIL", "SMS", "WHATSAPP"]).optional(),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
export type TemplateQuery = z.infer<typeof templateQuerySchema>;
