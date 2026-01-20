import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { randomBytes } from "crypto";
import { sendBookingConfirmationEmail, sendAdminNewReservationEmail } from "../notifications/transactionalEmail.service";

interface CreateBookingInput {
  clinicId: string;
  branchId: string;
  serviceId: string;
  therapistId?: string;
  startAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  requiresPayment?: boolean;
}

interface CreateCheckoutInput {
  bookingId: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a public booking from the widget
 */
export async function createPublicBooking(input: CreateBookingInput) {
  // Verify clinic and service exist
  const [clinic, service] = await Promise.all([
    prisma.clinic.findUnique({
      where: { id: input.clinicId },
      include: {
        subscription: { include: { plan: true } },
      },
    }),
    prisma.service.findUnique({
      where: { id: input.serviceId },
    }),
  ]);

  if (!clinic) {
    throw new Error("Clinic not found");
  }

  if (!service) {
    throw new Error("Service not found");
  }

  // Find or create client user
  let client = await prisma.user.findFirst({
    where: {
      email: input.clientEmail,
      clinicId: input.clinicId,
      role: "CLIENT",
    },
  });

  if (!client) {
    // Generate random password hash for guest users
    const tempPasswordHash = randomBytes(32).toString("hex");
    client = await prisma.user.create({
      data: {
        email: input.clientEmail,
        name: input.clientName,
        phone: input.clientPhone,
        role: "CLIENT",
        clinicId: input.clinicId,
        passwordHash: tempPasswordHash,
      },
    });
  }

  // Calculate end time based on service duration
  const startAt = new Date(input.startAt);
  const endAt = new Date(startAt.getTime() + service.defaultDuration * 60 * 1000);

  // Create the reservation
  const reservation = await prisma.reservation.create({
    data: {
      clinicId: input.clinicId,
      branchId: input.branchId,
      serviceId: input.serviceId,
      therapistId: input.therapistId,
      userId: client.id,
      startAt,
      endAt,
      notes: input.notes,
      status: input.requiresPayment ? "PENDING" : "CONFIRMED",
      paymentStatus: input.requiresPayment ? "UNPAID" : "PAID",
    },
    include: {
      service: { select: { name: true, basePrice: true } },
      branch: { select: { name: true, address: true } },
      therapist: {
        include: { 
          staff: { 
            include: { user: { select: { name: true } } } 
          } 
        },
      },
    },
  });

  // Format date/time for emails
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

  // Send confirmation email to client (if not requiring payment - payment emails sent after checkout)
  if (!input.requiresPayment || service.basePrice === 0) {
    await sendBookingConfirmationEmail(
      input.clinicId,
      input.clientEmail,
      client.id,
      {
        name: input.clientName,
        service: reservation.service.name,
        date: dateStr,
        time: timeStr,
        branch: reservation.branch.name,
      }
    );
  }

  // Notify admin about new reservation
  const adminUser = await prisma.user.findFirst({
    where: { clinicId: input.clinicId, role: "ADMIN" },
  });
  if (adminUser?.email) {
    await sendAdminNewReservationEmail(input.clinicId, adminUser.email, {
      name: input.clientName,
      service: reservation.service.name,
      date: dateStr,
      time: timeStr,
      branch: reservation.branch.name,
    });
  }

  return {
    id: reservation.id,
    status: reservation.status,
    paymentStatus: reservation.paymentStatus,
    startAt: reservation.startAt.toISOString(),
    endAt: reservation.endAt.toISOString(),
    service: {
      name: reservation.service.name,
      price: reservation.service.basePrice,
    },
    branch: reservation.branch,
    therapist: reservation.therapist?.staff?.user?.name ?? null,
    requiresPayment: input.requiresPayment && service.basePrice > 0,
    amount: service.basePrice,
  };
}

/**
 * Get public booking status
 */
export async function getPublicBookingStatus(bookingId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: bookingId },
    include: {
      clinic: {
        select: {
          name: true,
          slug: true,
          primaryColor: true,
          stripeAccountId: true,
          stripeChargesEnabled: true,
        },
      },
      service: { select: { name: true, basePrice: true, defaultDuration: true } },
      branch: { select: { name: true, address: true } },
      therapist: {
        include: { 
          staff: { 
            include: { user: { select: { name: true } } } 
          } 
        },
      },
      user: { select: { name: true, email: true } },
    },
  });

  if (!reservation) {
    return null;
  }

  return {
    id: reservation.id,
    status: reservation.status,
    paymentStatus: reservation.paymentStatus,
    startAt: reservation.startAt.toISOString(),
    endAt: reservation.endAt.toISOString(),
    clinic: reservation.clinic,
    service: {
      name: reservation.service.name,
      price: reservation.service.basePrice,
      durationMinutes: reservation.service.defaultDuration,
    },
    branch: reservation.branch,
    therapist: reservation.therapist?.staff?.user?.name ?? null,
    client: reservation.user,
    canPay:
      reservation.paymentStatus === "UNPAID" &&
      reservation.clinic.stripeAccountId &&
      reservation.clinic.stripeChargesEnabled,
  };
}

/**
 * Create Stripe Checkout session for a public booking
 */
export async function createPublicCheckout(input: CreateCheckoutInput) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: input.bookingId },
    include: {
      clinic: {
        include: {
          subscription: { include: { plan: true } },
        },
      },
      service: true,
      user: true,
    },
  });

  if (!reservation) {
    throw new Error("Booking not found");
  }

  if (reservation.paymentStatus !== "UNPAID") {
    throw new Error("Booking is already paid");
  }

  const { clinic, service } = reservation;

  if (!clinic.stripeAccountId) {
    throw new Error("Payments not configured for this business");
  }

  if (!clinic.stripeChargesEnabled) {
    throw new Error("Business cannot accept payments yet");
  }

  // Calculate fee
  const amount = service.basePrice; // en centavos
  const transactionFee = clinic.subscription?.plan?.transactionFee ?? 300;
  const applicationFee = Math.round((amount * transactionFee) / 10000);

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: clinic.currency.toLowerCase(),
          product_data: {
            name: service.name,
            description: `Cita en ${clinic.name}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: clinic.stripeAccountId,
      },
      metadata: {
        reservationId: reservation.id,
        clinicId: clinic.id,
        serviceId: service.id,
      },
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: reservation.user.email ?? undefined,
    metadata: {
      reservationId: reservation.id,
      clinicId: clinic.id,
      type: "public_booking",
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
    amount,
    applicationFee,
    netAmount: amount - applicationFee,
  };
}
