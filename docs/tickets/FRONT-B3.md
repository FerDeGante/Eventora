# FRONT-B3 — Stripe Connect Onboarding Flow

Title: Complete Stripe Connect Integration & Onboarding
Priority: B (High Priority - Critical for Payments)
Area: Payments / Settings / Frontend
Owner Role: Implementer / Reviewer

Problem (Evidence):
- Stripe Connect integration partially implemented
- `/settings/payments` shows UI but limited functionality
- Onboarding flow not fully tested end-to-end
- Missing webhook verification status
- No clear UX for incomplete onboarding states

Goal:
- Complete Stripe Connect onboarding flow
- Show clear status of Stripe account setup
- Handle all onboarding edge cases
- Display webhook health status

Scope (In/Out):
- In: Full onboarding flow, status checks, error handling, webhook status
- Out: Alternative payment providers (already scoped for later)

Plan:
1. Review current Stripe Connect implementation
2. Add comprehensive status checks (charges enabled, payouts enabled, webhooks configured)
3. Implement retry logic for failed onboarding
4. Add webhook health dashboard
5. Test full flow with Stripe test accounts
6. Document common issues and troubleshooting

Files to modify:
- apps/web/src/app/(app)/settings/payments/page.tsx
- apps/web/src/lib/admin-api.ts (Stripe endpoints)
- Backend: webhook handlers and status endpoints

Acceptance Criteria (Given/When/Then):
1. Given new clinic, When starts onboarding, Then completes all Stripe steps
2. Given incomplete onboarding, When returns to page, Then shows clear next steps
3. Given onboarding complete, When views status, Then shows "charges enabled"
4. Given webhooks, When checks health, Then displays last event received

Test Evidence Required:
- Manual: Complete full onboarding with Stripe test account
- Manual: Test "return URL" after Stripe redirect
- Manual: Verify webhook events display correctly
- API: Test all Stripe Connect endpoints

Backend Requirements:
- POST /api/v1/stripe/connect/onboarding → returns accountLink
- GET /api/v1/stripe/connect/status → returns full account status
- GET /api/v1/stripe/webhooks/health → returns last webhook events

UX Checks:
- [ ] Clear progress indicator during onboarding
- [ ] Helpful error messages for common issues
- [ ] "Retry" button for failed connections
- [ ] Link to Stripe dashboard when ready

Status:
- Estado: TODO
- Fecha: 2026-01-20

---

## Technical Notes

Current implementation has basic onboarding button but missing:
- Comprehensive status display (payouts_enabled, charges_enabled, details_submitted)
- Webhook health monitoring
- Error recovery flows
- Test mode indicator

**Stripe docs reference:**
- https://stripe.com/docs/connect/enable-payment-acceptance-guide
- https://stripe.com/docs/connect/webhooks
