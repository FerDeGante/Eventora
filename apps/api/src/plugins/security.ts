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
  // Helmet temporarily disabled due to version mismatch
  // await app.register(helmet, {
  //   contentSecurityPolicy: false,
  //   crossOriginEmbedderPolicy: false,
  // });

  // CORS temporarily disabled due to version mismatch  
  // await app.register(cors, {
  //   origin: parseAllowedOrigins(env.CORS_ALLOWED_ORIGINS),
  //   credentials: true,
  // });
});
