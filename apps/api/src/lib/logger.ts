import pino from "pino";
import { env } from "./env";
import { getTenantContext } from "./tenant-context";

const redactFields = [
  "req.headers.authorization",
  "req.headers.cookie",
  "headers.authorization",
  "headers.cookie",
  "*.password",
  "*.token",
  "*.secret",
  "*.otp",
];

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "eventora-api" },
  messageKey: "message",
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: redactFields,
    remove: true,
  },
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  mixin() {
    const ctx = getTenantContext();
    if (!ctx) return {};
    return {
      clinicId: ctx.clinicId,
      userId: ctx.userId,
    };
  },
});

export type Logger = typeof logger;
