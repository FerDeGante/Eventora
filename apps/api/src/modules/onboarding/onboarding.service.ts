import Stripe from 'stripe';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { env } from '../../lib/env';
import { SignupInput, SelectPlanInput } from './onboarding.schema';
import { sendWorkspaceWelcomeEmail } from '../notifications/transactionalEmail.service';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// ============================================
// PLANS
// ============================================

export async function getPlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
  });
}

// ============================================
// SLUG VALIDATION
// ============================================

export async function isSlugAvailable(slug: string): Promise<boolean> {
  // Lista de slugs reservados
  const reserved = [
    'admin', 'api', 'app', 'auth', 'billing', 'blog', 'dashboard', 
    'docs', 'help', 'login', 'logout', 'pricing', 'settings', 'signup',
    'support', 'terms', 'privacy', 'about', 'contact', 'embed', 'widget',
  ];
  
  if (reserved.includes(slug.toLowerCase())) {
    return false;
  }
  
  const existing = await prisma.clinic.findUnique({
    where: { slug: slug.toLowerCase() },
  });
  
  return !existing;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .substring(0, 50);
}

// ============================================
// SIGNUP FLOW
// ============================================

export async function createWorkspaceWithCheckout(input: SignupInput) {
  const { 
    email, password, name, phone,
    workspaceName, workspaceSlug,
    planId, interval,
    referralCode, source,
  } = input;

  // 1. Validar plan
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new Error('Plan not found');
  }

  // 2. Generar/validar slug
  let slug = workspaceSlug || generateSlug(workspaceName);
  if (!(await isSlugAvailable(slug))) {
    // Agregar sufijo único
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // 3. Verificar que el email no esté registrado como owner de otro workspace
  const existingOwner = await prisma.clinic.findFirst({
    where: { ownerUser: { email } },
  });
  if (existingOwner) {
    throw new Error('Email already registered as workspace owner');
  }

  // 4. Hashear password
  const passwordHash = await bcrypt.hash(password, 12);

  // 5. Crear workspace y usuario en una transacción
  const result = await prisma.$transaction(async (tx) => {
    // Crear el workspace primero
    const clinic = await tx.clinic.create({
      data: {
        name: workspaceName,
        slug,
        settings: {
          referralCode,
          source,
        },
      },
    });

    // Crear el usuario owner
    const user = await tx.user.create({
      data: {
        clinicId: clinic.id,
        email,
        passwordHash,
        name,
        phone,
        role: 'ADMIN',
      },
    });

    // Actualizar el ownerUserId del workspace
    await tx.clinic.update({
      where: { id: clinic.id },
      data: { ownerUserId: user.id },
    });

    // Crear la branch principal
    await tx.branch.create({
      data: {
        clinicId: clinic.id,
        name: 'Principal',
        timezone: 'America/Mexico_City',
      },
    });

    // Crear suscripción en estado TRIALING
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 días de trial

    const subscription = await tx.subscription.create({
      data: {
        clinicId: clinic.id,
        planId: plan.id,
        status: 'TRIALING',
        trialEndsAt,
      },
    });

    return { clinic, user, subscription };
  });

  // 6. Crear sesión de Stripe Checkout
  const priceId = interval === 'yearly' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
  
  if (!priceId) {
    // Plan gratuito o sin precio configurado
    return {
      workspace: result.clinic,
      user: result.user,
      checkoutUrl: null,
      message: 'Workspace created. No payment required.',
    };
  }

  const baseUrl = env.APP_URL || 'http://localhost:3000';
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/onboarding/cancelled`,
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        clinicId: result.clinic.id,
        userId: result.user.id,
      },
    },
    metadata: {
      clinicId: result.clinic.id,
      userId: result.user.id,
    },
  });

  // Guardar el ID de sesión para verificar después
  await prisma.subscription.update({
    where: { id: result.subscription.id },
    data: {
      stripeCustomerId: session.customer as string,
    },
  });

  return {
    workspace: result.clinic,
    user: { id: result.user.id, email: result.user.email, name: result.user.name },
    checkoutUrl: session.url,
  };
}

// ============================================
// SESSION VERIFICATION
// ============================================

export async function verifyCheckoutSession(sessionId: string) {
  // Retrieve Stripe session
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }

  const clinicId = session.metadata?.clinicId;
  const userId = session.metadata?.userId;

  if (!clinicId || !userId) {
    throw new Error('Invalid session metadata');
  }

  // Verify payment status
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    // Check if it's a trial (no payment required yet)
    const subscription = session.subscription 
      ? await stripe.subscriptions.retrieve(session.subscription as string)
      : null;
    
    if (!subscription || subscription.status !== 'trialing') {
      throw new Error('Payment not completed');
    }
  }

  // Get user and clinic
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, clinicId: true },
  });

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { id: true, name: true, slug: true },
  });

  if (!user || !clinic) {
    throw new Error('User or workspace not found');
  }

  // Generate JWT
  const jwt = await import('jsonwebtoken');
  const accessToken = jwt.default.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    success: true,
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    workspace: {
      id: clinic.id,
      name: clinic.name,
      slug: clinic.slug,
    },
  };
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const clinicId = session.metadata?.clinicId;
  if (!clinicId) return;

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Obtener detalles de la suscripción
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Acceder a las propiedades del periodo de forma segura
  const periodStart = (stripeSubscription as any).current_period_start;
  const periodEnd = (stripeSubscription as any).current_period_end;

  await prisma.subscription.update({
    where: { clinicId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: stripeSubscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE',
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });

  // Enviar email de bienvenida al owner
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: { ownerUser: true },
  });

  if (clinic?.ownerUser?.email) {
    await sendWorkspaceWelcomeEmail(clinicId, clinic.ownerUser.email, {
      name: clinic.ownerUser.name || 'Usuario',
      workspaceName: clinic.name,
      slug: clinic.slug,
      trialDays: 14,
    });
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const clinicId = subscription.metadata?.clinicId;
  if (!clinicId) {
    // Buscar por stripeSubscriptionId
    const sub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!sub) return;

    await updateSubscriptionFromStripe(sub.clinicId, subscription);
    return;
  }

  await updateSubscriptionFromStripe(clinicId, subscription);
}

async function updateSubscriptionFromStripe(clinicId: string, subscription: Stripe.Subscription) {
  const statusMap: Record<string, 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID'> = {
    trialing: 'TRIALING',
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'UNPAID',
  };

  // Acceder a las propiedades del periodo de forma segura
  const periodStart = (subscription as any).current_period_start;
  const periodEnd = (subscription as any).current_period_end;

  await prisma.subscription.update({
    where: { clinicId },
    data: {
      status: statusMap[subscription.status] || 'ACTIVE',
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'CANCELED' },
    });
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'PAST_DUE' },
    });

    // TODO: Enviar email de pago fallido
  }
}
