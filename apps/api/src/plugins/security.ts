import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import { env } from "../lib/env";

const parseAllowedOrigins = (value?: string): string[] | true => {
  if (!value) return true;
  const origins = value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : true;
};

export default fp(async (app) => {
  // Security headers with Helmet
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  // CORS configuration
  await app.register(cors, {
    origin: parseAllowedOrigins(env.CORS_ALLOWED_ORIGINS),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Clinic-Id", "X-User-Id", "X-User-Roles"],
  });
});
