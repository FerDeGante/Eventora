# Stripe Readiness Checklist

## Catalog & Pricing
- [ ] Map plans → Stripe Prices with metadata `{ clinicId?, planTier, maxUsers, maxAppointments }`.
- [ ] Create onboarding script to sync Prisma `Package` records with Stripe (`stripe.products.update` ↔ `package.stripePriceId`).
- [ ] Version packages via `active` flag instead of deleting to preserve historic invoices.

## Checkout & Billing Flow
- [ ] Include `clinicId`, `userId`, `packageId`, `planTier`, `expiresAt` in `CheckoutSession.metadata`.
- [ ] Require authenticated session prior to hitting `/api/stripe/checkout`.
- [ ] Use idempotency keys per clinic+user when creating checkout sessions.
- [ ] Support promotional codes / trials by storing Stripe coupon IDs and validating plan compatibility.
- [ ] Configure proration behavior for upgrades/downgrades (Stripe Billing settings or API `proration_behavior`).

## Webhooks
- [ ] Verify signature with `STRIPE_WEBHOOK_SECRET` (already implemented) **and** store `event.id` to guarantee idempotency.
- [ ] Persist webhook payloads to `StripeEvent` table for replay/forensics.
- [ ] Process events asynchronously via queue worker (BullMQ/Cloud Tasks) to avoid timeouts.
- [ ] Key events to handle:
  - `checkout.session.completed` → provision package, emit audit log.
  - `invoice.payment_succeeded/failed` → update billing status, notify tenant admins.
  - `customer.subscription.updated/deleted` → enforce plan limits.
- [ ] Guard against tenant spoofing by verifying metadata `clinicId` matches session tenant context.

## Plan Enforcement
- [ ] Store plan entitlements in `ClinicPlan` table (`maxTherapists`, `maxActiveClients`, `appointmentsPerMonth`).
- [ ] Enforce limits before allowing new reservations/users (return 402 or display upsell).
- [ ] Implement grace periods (e.g., 7 days) after failed payment before disabling functionality.

## Testing Matrix
- [ ] Unit tests for webhook handler validating metadata + idempotency.
- [ ] Integration tests: simulate success, failure, dispute events using Stripe CLI (`stripe trigger`).
- [ ] Regression tests covering tenant isolation (metadata mismatch should reject event).
- [ ] Manual QA checklist for taxes (IVA), invoice PDF formatting, and refund flows.

## Compliance & Operations
- [ ] Rotate Stripe API keys every 90 days; store in secure secrets manager.
- [ ] Enable Stripe Radar advanced rules; log risk score per transaction.
- [ ] Define incident runbook for payment outages (fallback to manual invoicing).
- [ ] Monitor webhook delivery latency and retry counts; alert on >5 retries/hour per tenant.

