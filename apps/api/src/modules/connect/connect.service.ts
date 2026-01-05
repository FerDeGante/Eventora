import Stripe from 'stripe';
import { prisma } from '../../lib/prisma';
import { env } from '../../lib/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// ============================================
// STRIPE CONNECT ONBOARDING
// ============================================

export async function createConnectAccount(clinicId: string, refreshUrl?: string, returnUrl?: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { 
      id: true, 
      name: true, 
      slug: true, 
      stripeAccountId: true,
      ownerUser: { select: { email: true } },
    },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  let accountId = clinic.stripeAccountId;

  // Crear cuenta de Stripe Connect si no existe
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express', // Express es el más fácil de implementar
      country: 'MX',
      email: clinic.ownerUser?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: clinic.name,
        url: `https://eventora.app/${clinic.slug}`,
      },
      metadata: {
        clinicId: clinic.id,
        clinicSlug: clinic.slug,
      },
    });

    accountId = account.id;

    // Guardar el account ID
    await prisma.clinic.update({
      where: { id: clinicId },
      data: { stripeAccountId: accountId },
    });
  }

  // Crear link de onboarding
  const baseUrl = env.APP_URL || 'http://localhost:3000';
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl || `${baseUrl}/dashboard/settings?stripe=refresh`,
    return_url: returnUrl || `${baseUrl}/dashboard/settings?stripe=success`,
    type: 'account_onboarding',
  });

  return {
    accountId,
    onboardingUrl: accountLink.url,
    expiresAt: new Date(accountLink.expires_at * 1000),
  };
}

export async function getConnectAccountStatus(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { 
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      stripeChargesEnabled: true,
      stripePayoutsEnabled: true,
    },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  if (!clinic.stripeAccountId) {
    return {
      connected: false,
      onboardingComplete: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    };
  }

  // Obtener estado actual de Stripe
  const account = await stripe.accounts.retrieve(clinic.stripeAccountId);

  // Actualizar en BD si cambió
  if (
    account.charges_enabled !== clinic.stripeChargesEnabled ||
    account.payouts_enabled !== clinic.stripePayoutsEnabled ||
    account.details_submitted !== clinic.stripeOnboardingComplete
  ) {
    await prisma.clinic.update({
      where: { id: clinicId },
      data: {
        stripeOnboardingComplete: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
      },
    });
  }

  return {
    connected: true,
    accountId: account.id,
    onboardingComplete: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirements: account.requirements,
  };
}

export async function createLoginLink(clinicId: string) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { stripeAccountId: true },
  });

  if (!clinic?.stripeAccountId) {
    throw new Error('Stripe Connect account not found');
  }

  const loginLink = await stripe.accounts.createLoginLink(clinic.stripeAccountId);

  return { url: loginLink.url };
}

// ============================================
// STRIPE CONNECT PAYMENTS
// ============================================

export async function createPaymentIntent(
  clinicId: string,
  amount: number, // en centavos
  currency: string = 'mxn',
  metadata?: Record<string, string>
) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  });

  if (!clinic?.stripeAccountId) {
    throw new Error('Stripe Connect not configured for this workspace');
  }

  if (!clinic.stripeChargesEnabled) {
    throw new Error('Stripe charges not enabled. Complete onboarding first.');
  }

  // Calcular comisión de Eventora (default 3%)
  const transactionFee = clinic.subscription?.plan?.transactionFee || 300; // basis points
  const applicationFee = Math.round((amount * transactionFee) / 10000);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: clinic.stripeAccountId,
    },
    metadata: {
      clinicId,
      ...metadata,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount,
    applicationFee,
    netAmount: amount - applicationFee,
  };
}

export async function createCheckoutSession(
  clinicId: string,
  lineItems: Array<{
    name: string;
    amount: number; // centavos
    quantity: number;
  }>,
  successUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  metadata?: Record<string, string>
) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  });

  if (!clinic?.stripeAccountId) {
    throw new Error('Stripe Connect not configured');
  }

  // Calcular total y fee
  const total = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  const transactionFee = clinic.subscription?.plan?.transactionFee || 300;
  const applicationFee = Math.round((total * transactionFee) / 10000);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: clinic.currency.toLowerCase(),
        product_data: { name: item.name },
        unit_amount: item.amount,
      },
      quantity: item.quantity,
    })),
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: clinic.stripeAccountId,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      clinicId,
      ...metadata,
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

// ============================================
// STRIPE CONNECT WEBHOOK HANDLERS
// ============================================

export async function handleAccountUpdated(account: Stripe.Account) {
  const clinicId = account.metadata?.clinicId;
  
  if (!clinicId) {
    // Buscar por stripeAccountId
    const clinic = await prisma.clinic.findFirst({
      where: { stripeAccountId: account.id },
    });
    if (!clinic) return;

    await prisma.clinic.update({
      where: { id: clinic.id },
      data: {
        stripeOnboardingComplete: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
      },
    });
    return;
  }

  await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      stripeOnboardingComplete: account.details_submitted,
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
    },
  });
}

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const clinicId = paymentIntent.metadata?.clinicId;
  const reservationId = paymentIntent.metadata?.reservationId;
  const userPackageId = paymentIntent.metadata?.userPackageId;

  if (!clinicId) return;

  // Actualizar el pago en nuestra BD
  await prisma.paymentIntent.updateMany({
    where: { providerRef: paymentIntent.id },
    data: {
      status: 'PAID',
    },
  });

  // Si es una reserva, actualizar estado
  if (reservationId) {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { paymentStatus: 'PAID' },
    });
  }

  // Si es un paquete, activarlo
  if (userPackageId) {
    await prisma.userPackage.update({
      where: { id: userPackageId },
      data: { startDate: new Date() },
    });
  }
}
