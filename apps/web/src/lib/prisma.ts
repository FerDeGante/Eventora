// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

declare global {
  // Evita múltiples instancias de PrismaClient en desarrollo
  // para que Next.js no cree un nuevo cliente en cada recarga de módulo
  // (evita "PooledClient disconnected" y warnings de instancias duplicadas)
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "error"],
  });

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;