import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { mpPreference, mpPayment } from "../../lib/mercadopago";
import { env } from "../../lib/env";
import { assertTenant } from "../../utils/tenant";
import { withTenantContext } from "../../lib/tenant-context";
import type { CheckoutSessionInput, PaymentQuery, RefundInput } from "./payment.schema";
import { enqueueTicketPrint } from "../pos/printJob.service";
import { sendPaymentConfirmationEmail, sendBookingConfirmationEmail } from "../notifications/transactionalEmail.service";

export const createCheckoutSession = async (input: CheckoutSessionInput) => {
  const { clinicId } = assertTenant();

  const metadata: Record<string, string> = {
    clinicId,
    userId: input.userId,
    mode: input.mode,
  };

  if (input.reservationId) metadata.reservationId = input.reservationId;
  if (input.packageId) metadata.packageId = input.packageId;

  const lineItem = input.priceId
    ? { price: input.priceId, quantity: 1 }
    : {
        price_data: {
          currency: input.currency.toLowerCase(),
          product_data: {
            name: input.mode === "package" ? "Eventora package" : "Reservation",
          },
          unit_amount: (input.amount ?? 0) * 100,
        },
        quantity: 1,
      };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    line_items: [lineItem],
    metadata,
  });

  return session;
};

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const metadata = session.metadata || {};
  const clinicId = metadata.clinicId;
  if (!clinicId) throw new Error("Missing clinicId in metadata");

  return withTenantContext({ clinicId }, async () => {
    const amountTotal = session.amount_total ? Math.round(session.amount_total / 100) : 0;
    const currency = (session.currency ?? "mxn").toUpperCase();
    const providerRef = session.payment_intent?.toString() ?? session.id;

    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        clinicId,
        amount: amountTotal,
        currency,
        provider: "STRIPE",
        providerRef,
        status: "PAID",
        userId: metadata.userId ?? null,
      },
    });

    // Handle public booking checkout
    if (metadata.type === "public_booking" && metadata.reservationId) {
      await prisma.reservation.updateMany({
        where: { id: metadata.reservationId, clinicId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentIntentId: paymentIntent.id,
        },
      });
    } else if (metadata.mode === "reservation" && metadata.reservationId) {
      await prisma.reservation.updateMany({
        where: { id: metadata.reservationId, clinicId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentIntentId: paymentIntent.id,
        },
      });
    } else if (metadata.mode === "package" && metadata.packageId && metadata.userId) {
      const pkg = await prisma.package.findFirst({ where: { id: metadata.packageId, clinicId } });
      if (!pkg) throw new Error("Package not found");

      const userPackage = await prisma.userPackage.create({
        data: {
          clinicId,
          userId: metadata.userId,
          packageId: pkg.id,
          sessionsTotal: pkg.sessions,
          sessionsRemaining: pkg.sessions,
          pricePaid: amountTotal,
          paymentSource: "STRIPE",
        },
      });

      await prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: { userPackageId: userPackage.id },
      });
    }

    await enqueueTicketPrint(paymentIntent.id);

    // Send payment confirmation and booking confirmation emails for public bookings
    if (metadata.type === "public_booking" && metadata.reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: metadata.reservationId },
        include: {
          user: true,
          service: true,
          branch: true,
        },
      });

      if (reservation?.user?.email) {
        const dateStr = reservation.startAt.toLocaleDateString("es-MX", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const timeStr = reservation.startAt.toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Send payment confirmation
        await sendPaymentConfirmationEmail(
          clinicId,
          reservation.user.email,
          reservation.user.id,
          {
            name: reservation.user.name || "Cliente",
            amount: (amountTotal / 100).toFixed(2),
            currency: currency,
            description: reservation.service?.name || "Reservación",
            paymentId: providerRef,
            date: new Date().toLocaleDateString("es-MX"),
          }
        );

        // Send booking confirmation
        await sendBookingConfirmationEmail(
          clinicId,
          reservation.user.email,
          reservation.user.id,
          {
            name: reservation.user.name || "Cliente",
            service: reservation.service?.name || "Servicio",
            date: dateStr,
            time: timeStr,
            branch: reservation.branch?.name || "",
          }
        );
      }
    }
  });
};

export const createMercadoPagoPreference = async (input: CheckoutSessionInput) => {
  const { clinicId } = assertTenant();

  const metadata = {
    clinicId,
    userId: input.userId,
    mode: input.mode,
    reservationId: input.reservationId,
    packageId: input.packageId,
  };

  const title = input.mode === "package" ? "Eventora package" : "Reservation";
  const amount = input.amount ?? 0;

  const preference = await mpPreference.create({
    body: {
      items: [
        {
          id: input.packageId ?? input.reservationId ?? "item",
          title,
          quantity: 1,
          unit_price: amount,
          currency_id: input.currency.toUpperCase(),
        },
      ],
      back_urls: {
        success: input.successUrl,
        failure: input.cancelUrl,
        pending: input.cancelUrl,
      },
      notification_url: `${env.APP_BASE_URL ?? "http://localhost:4000"}/api/webhooks/mercadopago`,
      external_reference: JSON.stringify(metadata),
    },
  });

  return preference;
};

export const handleMercadoPagoPayment = async (payment: any) => {
  if (payment.status !== "approved") {
    return;
  }

  let metadata: Record<string, string> = {};
  if (payment.external_reference) {
    try {
      metadata = JSON.parse(payment.external_reference);
    } catch (e) {
      metadata = {};
    }
  }

  const clinicId = metadata.clinicId;
  if (!clinicId) throw new Error("Missing clinicId in Mercado Pago metadata");

  return withTenantContext({ clinicId }, async () => {
    const amount = Math.round(payment.transaction_amount);
    const currency = (payment.currency_id ?? "MXN").toUpperCase();
    const providerRef = payment.id?.toString() ?? payment.payment_intent_id?.toString() ?? "";

    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        clinicId,
        amount,
        currency,
        provider: "MERCADO_PAGO",
        providerRef,
        status: "PAID",
        userId: metadata.userId ?? null,
      },
    });

    if (metadata.mode === "reservation" && metadata.reservationId) {
      await prisma.reservation.updateMany({
        where: { id: metadata.reservationId, clinicId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paymentIntentId: paymentIntent.id,
        },
      });
    } else if (metadata.mode === "package" && metadata.packageId && metadata.userId) {
      const pkg = await prisma.package.findFirst({ where: { id: metadata.packageId, clinicId } });
      if (!pkg) throw new Error("Package not found");

      const userPackage = await prisma.userPackage.create({
        data: {
          clinicId,
          userId: metadata.userId,
          packageId: pkg.id,
          sessionsTotal: pkg.sessions,
          sessionsRemaining: pkg.sessions,
          pricePaid: amount,
          paymentSource: "MERCADO_PAGO",
        },
      });

      await prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: { userPackageId: userPackage.id },
      });
    }

    await enqueueTicketPrint(paymentIntent.id);
  });
};

const applyPaymentToReservationOrPackage = async (
  paymentIntentId: string,
  clinicId: string,
  metadata: Record<string, string>,
  amount: number,
) => {
  if (metadata.mode === "reservation" && metadata.reservationId) {
    await prisma.reservation.updateMany({
      where: { id: metadata.reservationId, clinicId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        paymentIntentId,
      },
    });
  } else if (metadata.mode === "package" && metadata.packageId && metadata.userId) {
    const pkg = await prisma.package.findFirst({ where: { id: metadata.packageId, clinicId } });
    if (!pkg) throw new Error("Package not found");
    const userPackage = await prisma.userPackage.create({
      data: {
        clinicId,
        userId: metadata.userId,
        packageId: pkg.id,
        sessionsTotal: pkg.sessions,
        sessionsRemaining: pkg.sessions,
        pricePaid: amount,
        paymentSource: "CASH",
      },
    });
    await prisma.paymentIntent.update({
      where: { id: paymentIntentId },
      data: { userPackageId: userPackage.id },
    });
  }
};

export const recordCashPayment = async (input: CheckoutSessionInput) => {
  const { clinicId } = assertTenant();
  const amount = input.amount ?? 0;
  const payment = await prisma.paymentIntent.create({
    data: {
      clinicId,
      amount,
      currency: input.currency.toUpperCase(),
      provider: "CASH",
      status: "PAID",
      userId: input.userId,
    },
  });

  await applyPaymentToReservationOrPackage(
    payment.id,
    clinicId,
    {
      mode: input.mode,
      reservationId: input.reservationId ?? "",
      packageId: input.packageId ?? "",
      userId: input.userId,
    },
    amount,
  );

  await enqueueTicketPrint(payment.id);
  return payment;
};

export const recordTerminalPayment = async (input: CheckoutSessionInput) => {
  const { clinicId } = assertTenant();
  if (!input.terminalId) throw new Error("terminalId is required for terminal payments");
  const terminal = await prisma.posTerminal.findFirst({
    where: { id: input.terminalId, clinicId, status: "ACTIVE" },
    include: { printers: { where: { status: "ACTIVE" }, orderBy: { createdAt: "asc" } } },
  });
  if (!terminal) throw new Error("Terminal not found");
  const amount = input.amount ?? 0;
  const payment = await prisma.paymentIntent.create({
    data: {
      clinicId,
      amount,
      currency: input.currency.toUpperCase(),
      provider: "POS",
      status: "PAID",
      userId: input.userId,
      terminalId: terminal.id,
    },
  });

  await applyPaymentToReservationOrPackage(
    payment.id,
    clinicId,
    {
      mode: input.mode,
      reservationId: input.reservationId ?? "",
      packageId: input.packageId ?? "",
      userId: input.userId,
    },
    amount,
  );

  const defaultPrinterId = terminal.printers?.[0]?.id;
  await enqueueTicketPrint(payment.id, defaultPrinterId);
  return payment;
};

export const listPayments = async (query: PaymentQuery) => {
  const { clinicId } = assertTenant();
  const { page, limit, status, provider, userId, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const where: any = { clinicId };
  if (status) where.status = status;
  if (provider) where.provider = provider;
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [payments, total] = await Promise.all([
    prisma.paymentIntent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        User: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.paymentIntent.count({ where }),
  ]);

  return {
    data: payments,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPaymentById = async (id: string) => {
  const { clinicId } = assertTenant();
  const payment = await prisma.paymentIntent.findUnique({
    where: { id },
    include: {
      User: { select: { id: true, name: true, email: true } },
      // reservation: true, // Relation might not exist directly on paymentIntent in schema, check schema
      // userPackage: { include: { package: true } },
    },
  });

  if (!payment || payment.clinicId !== clinicId) {
    throw new Error("Payment not found");
  }

  return payment;
};

export const refundPayment = async (id: string, input: RefundInput) => {
  const { clinicId } = assertTenant();
  const payment = await prisma.paymentIntent.findUnique({
    where: { id },
  });

  if (!payment || payment.clinicId !== clinicId) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "PAID") {
    throw new Error("Payment is not in PAID status");
  }

  // Logic for Stripe refund
  if (payment.provider === "STRIPE" && payment.providerRef) {
    try {
      await stripe.refunds.create({
        payment_intent: payment.providerRef,
        amount: input.amount ? input.amount * 100 : undefined,
        reason: "requested_by_customer",
      });
    } catch (error) {
      console.error("Stripe refund failed:", error);
      // Continue to update DB or throw? Let's throw for now to be safe
      throw new Error("Stripe refund failed");
    }
  }

  const updatedPayment = await prisma.paymentIntent.update({
    where: { id },
    data: {
      status: "REFUNDED",
      metadata: {
        ...((payment.metadata as object) || {}),
        refundReason: input.reason,
        refundAmount: input.amount,
        refundedAt: new Date().toISOString(),
      },
    },
  });

  return updatedPayment;
};
