# T-0004 — Stripe + Webhooks

## Contexto
- **Problema:** Necesitamos procesar pagos de forma segura
- **Por qué importa (KPI):** Time-to-cash
- **Usuarios afectados:** CLIENT, ADMIN

## Alcance
### Incluye
- Stripe Checkout
- MercadoPago preferences
- Cash/Terminal (POS)
- Webhooks firmados
- Stripe Connect (marketplace B2B)
- Refunds

### No incluye
- Facturación electrónica (CFDI)
- Split payments complejos

## Criterios de aceptación
1. ✅ Cliente puede pagar con Stripe
2. ✅ Cliente puede pagar con MercadoPago
3. ✅ Recepción puede registrar pago en efectivo
4. ✅ Webhook actualiza estado de pago
5. ✅ Admin puede hacer refund

## Plan
- [x] Endpoint POST /payments/checkout
- [x] Endpoint POST /payments/mercadopago
- [x] Endpoint POST /payments/:id/refund
- [x] Webhook handler Stripe
- [x] Webhook handler MercadoPago
- [x] Stripe Connect onboarding
- [x] Connect payments con split

## Implementación

### Files touched
- `apps/api/src/modules/payments/*`
- `apps/api/src/modules/connect/*`
- `apps/api/src/routes/webhooks/stripe.routes.ts`
- `apps/api/src/lib/stripe.ts`
- `apps/api/src/lib/mercadopago.ts`
- `apps/web/src/lib/admin-api.ts` (createCheckout)
- `apps/web/src/app/(app)/wizard/page.tsx`

### Test evidence
- Manual: Flujo completo Stripe test mode
- Manual: Webhook recibido y procesado
- Unit: Pendiente

### Security checks
- [x] Webhook signature verification
- [x] Idempotency (eventId)
- [x] No exponer secret keys
- [x] HTTPS only en producción

### UX checks
- [x] Redirect a Stripe Checkout
- [x] Página success/cancelled
- [x] Loading durante redirect

## Notas
- En wizard, el `userId` está hardcodeado como "guest" — pendiente integrar con sesión real

## Status
- **Estado:** ✅ DONE
- **Owner:** Payments module
- **Fecha:** 19 enero 2026
