import { Prisma, PrismaClient } from "@prisma/client";
import { getTenantContext } from "./tenant-context";
import { logger } from "./logger";

const SENSITIVE_KEYS = ["password", "passwordHash", "token", "secret", "otp"];

const sanitizeAuditData = (input: unknown): Prisma.InputJsonValue | undefined => {
  if (input === null || input === undefined) return undefined;

  if (Array.isArray(input)) {
    const items = input
      .slice(0, 5)
      .map((item) => sanitizeAuditData(item))
      .filter((value): value is Prisma.InputJsonValue => value !== undefined);
    return items as Prisma.InputJsonValue;
  }

  if (typeof input === "object") {
    const clean: Record<string, Prisma.InputJsonValue> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        continue;
      }
      const sanitized = sanitizeAuditData(value);
      if (sanitized !== undefined) {
        clean[key] = sanitized;
      }
    }
    return clean;
  }

  if (typeof input === "string") {
    return input.length > 120 ? `${input.slice(0, 120)}...` : input;
  }
  if (typeof input === "number" || typeof input === "boolean") return input;
  return String(input);
};

export type AuditEntry = {
  action: string;
  entity: string;
  entityId?: string;
  data?: unknown;
};

export const writeAuditLog = async (client: PrismaClient, entry: AuditEntry): Promise<void> => {
  const ctx = getTenantContext();
  if (!ctx?.clinicId) return;

  try {
    await client.auditLog.create({
      data: {
        clinicId: ctx.clinicId,
        actorUserId: ctx.userId,
        entityType: entry.entity,
        entityId: entry.entityId ?? "unknown",
        action: entry.action,
        diff: entry.data ? sanitizeAuditData(entry.data) : undefined,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      },
    });
  } catch (error) {
    logger.warn({ error, entity: entry.entity, action: entry.action }, "Failed to write audit log");
  }
};
