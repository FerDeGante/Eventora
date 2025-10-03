// src/pages/api/admin/reservations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

// Utilidades
const isAguaOPiso = (name: string) => /agua/i.test(name) || /piso/i.test(name);
const normalizeToMinute = (d: Date) => {
  const n = new Date(d);
  n.setSeconds(0, 0);
  return n;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth + rol
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  // ---------- CREAR RESERVACIÓN ----------
  if (req.method === "POST") {
    const {
      userId,
      packageId,
      branchId,
      date,              // ISO (yyyy-MM-ddTHH:mm)
      paymentMethod,     // "efectivo" | "transferencia"
      userPackageId,     // opcional
    } = (req.body || {}) as {
      userId: string;
      packageId: string;
      branchId: string;
      date: string;
      paymentMethod?: "efectivo" | "transferencia";
      userPackageId?: string;
    };

    if (!userId || !packageId || !branchId || !date) {
      return res.status(400).json({ error: "Faltan datos: userId, packageId, branchId, date." });
    }

    const slotDateRaw = new Date(date);
    if (isNaN(slotDateRaw.getTime())) {
      return res.status(400).json({ error: "Fecha inválida." });
    }
    const slotDate = normalizeToMinute(slotDateRaw);

    try {
      // 1) Cargar paquete
      const pkg = await prisma.package.findUnique({ where: { id: packageId } });
      if (!pkg) return res.status(404).json({ error: "Paquete no encontrado." });

      // 2) Obtener/crear UserPackage con sesiones disponibles
      let up = userPackageId
        ? await prisma.userPackage.findUnique({ where: { id: userPackageId } })
        : await prisma.userPackage.findFirst({
            where: { userId, packageId, sessionsRemaining: { gt: 0 } },
            orderBy: { createdAt: "asc" },
          });

      const createdNewUP = !up;
      if (!up) {
        up = await prisma.userPackage.create({
          data: {
            userId,
            packageId,
            sessionsRemaining: pkg.sessions,
            paymentSource: "manual",
          },
        });
      }

      // 3) Vigencia (30 días desde PRIMERA sesión del UserPackage)
      let firstSessionDate: Date | null = null;
      const firstRes = await prisma.reservation.findFirst({
        where: { userPackageId: up.id },
        orderBy: { date: "asc" },
        select: { date: true },
      });
      if (firstRes) firstSessionDate = firstRes.date;
      else if (createdNewUP) firstSessionDate = slotDate;
      else firstSessionDate = slotDate;

      if (firstSessionDate) {
        const min = new Date(firstSessionDate);
        const max = new Date(firstSessionDate);
        max.setDate(max.getDate() + 29);
        if (slotDate < min || slotDate > max) {
          return res.status(409).json({
            error: "Fuera de la vigencia del paquete (30 días desde la primera sesión).",
          });
        }
      }

      // 4) Capacidad por slot/sucursal
      const maxPerSlot = isAguaOPiso(pkg.name) ? 3 : 1;
      const baseWhere: any = { branchId, date: slotDate };
      // Para agua/piso el aforo es por paquete; para otros, es global al slot
      const slotWhere = isAguaOPiso(pkg.name)
        ? { ...baseWhere, packageId }
        : baseWhere;

      // 5) Transacción: revalidar aforo y descontar sesión en un paso
      const created = await prisma.$transaction(async (tx) => {
        // Aforo dentro de la transacción (evita carreras)
        const taken = await tx.reservation.count({ where: slotWhere });
        if (taken >= maxPerSlot) {
          throw new Error("AFORO");
        }

        // Verificar sesiones disponibles
        const freshUP = await tx.userPackage.findUnique({
          where: { id: up!.id },
          select: { sessionsRemaining: true },
        });
        if (!freshUP || freshUP.sessionsRemaining <= 0) {
          throw new Error("SIN_SESIONES");
        }

        // Crear reserva
        const reservation = await tx.reservation.create({
          data: {
            userId,
            packageId,
            branchId,
            date: slotDate,
            userPackageId: up!.id,
            paymentMethod: paymentMethod === "transferencia" ? "transferencia" : "efectivo",
          },
          select: { id: true, date: true, userId: true, packageId: true, branchId: true, userPackageId: true, paymentMethod: true },
        });

        // Descontar 1 sesión
        await tx.userPackage.update({
          where: { id: up!.id },
          data: { sessionsRemaining: { decrement: 1 } },
        });

        return reservation;
      });

      return res.status(201).json({
        ...created,
        date: created.date.toISOString(),
        message: "Reservación creada.",
      });
    } catch (err: any) {
      if (err?.message === "AFORO")        return res.status(409).json({ error: "Horario no disponible para este paquete/sucursal." });
      if (err?.message === "SIN_SESIONES") return res.status(409).json({ error: "Sin sesiones disponibles en el paquete." });
      console.error("POST /api/admin/reservations error:", err);
      return res.status(500).json({ error: "Error al crear la reservación." });
    }
  }

  // ---------- LISTAR RESERVAS ----------
  if (req.method === "GET") {
    const { date, start, end } = req.query as { date?: string; start?: string; end?: string };

    // Por día
    if (date) {
      const dayStart = new Date(date + "T00:00:00");
      const dayEnd   = new Date(date + "T23:59:59.999");

      const reservations = await prisma.reservation.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        include: {
          user:      { select: { name: true } },
          package:   { select: { name: true, sessions: true, price: true } },
          therapist: { include: { user: { select: { name: true } } } },
          userPackage: { select: { id: true } },
        },
        orderBy: { date: "asc" },
      });

      // Calcular sessionNumber por UserPackage
      const upIds = Array.from(new Set(reservations.map(r => r.userPackage?.id).filter(Boolean) as string[]));
      const upToReservs: Record<string, { id: string; date: Date }[]> = {};
      await Promise.all(
        upIds.map(async (upId) => {
          upToReservs[upId] = await prisma.reservation.findMany({
            where: { userPackageId: upId },
            orderBy: { date: "asc" },
            select: { id: true, date: true },
          });
        })
      );

      const result = reservations.map((r) => {
        let sessionNumber = 1;
        let totalSessions = r.package?.sessions || 1;
        const upId = r.userPackage?.id || "";
        if (upId && upToReservs[upId]) {
          const list = upToReservs[upId];
          sessionNumber = list.findIndex(x => x.id === r.id) + 1;
        }
        return {
          id: r.id,
          date: r.date.toISOString(),
          userName: r.user?.name || "",
          serviceName: r.package?.name || "",
          therapistName: r.therapist?.user?.name || "",
          paymentMethod: r.paymentMethod,
          sessionNumber,
          totalSessions,
          packagePrice: r.package?.price ?? null,
        };
      });

      return res.status(200).json(result);
    }

    // Por rango (para calendario)
    if (start && end) {
      const reservations = await prisma.reservation.findMany({
        where: { date: { gte: new Date(start), lte: new Date(end) } },
        select: { date: true },
      });
      return res.status(200).json(reservations);
    }

    return res.status(400).json({ error: "Faltan parámetros: date o start/end" });
  }

  // ---------- REPROGRAMAR ----------
  if (req.method === "PATCH") {
    const { reservationId, newDate, newTime } = req.body as {
      reservationId: string;
      newDate: string; // 'YYYY-MM-DD'
      newTime: string; // 'HH:mm'
    };

    if (!reservationId || !newDate || !newTime) {
      return res.status(400).json({ error: "Datos incompletos." });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { package: true, branch: true },
    });
    if (!reservation) return res.status(404).json({ error: "Reservación no encontrada." });

    const newDateObj = normalizeToMinute(new Date(`${newDate}T${newTime}`));

    // Vigencia 30 días desde 1ª sesión del mismo UserPackage
    let firstSessionDate = reservation.date;
    if (reservation.userPackageId) {
      const first = await prisma.reservation.findFirst({
        where: { userPackageId: reservation.userPackageId },
        orderBy: { date: "asc" },
        select: { date: true },
      });
      if (first) firstSessionDate = first.date;
    }
    const min = new Date(firstSessionDate);
    const max = new Date(firstSessionDate); max.setDate(max.getDate() + 29);
    if (newDateObj < min || newDateObj > max) {
      return res.status(400).json({ error: "La nueva fecha debe estar dentro de la vigencia del paquete (30 días)." });
    }

    // Aforo
    const maxPerSlot = isAguaOPiso(reservation.package.name) ? 3 : 1;
    const baseWhere: any = { branchId: reservation.branchId, date: newDateObj, id: { not: reservationId } };
    const where = isAguaOPiso(reservation.package.name)
      ? { ...baseWhere, packageId: reservation.packageId }
      : baseWhere;

    const taken = await prisma.reservation.count({ where });
    if (taken >= maxPerSlot) {
      return res.status(409).json({ error: "Horario no disponible para este paquete." });
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { date: newDateObj },
      select: { id: true, date: true },
    });

    return res.status(200).json({
      id: updated.id,
      date: updated.date.toISOString(),
      message: "Reservación actualizada correctamente.",
    });
  }

  res.setHeader("Allow", ["POST", "GET", "PATCH"]);
  return res.status(405).end("Method Not Allowed");
}