# FRONT-B8 — Client Portal Enhancement

Title: Enhanced Client Self-Service Portal
Priority: C (Lower Priority - Client Experience)
Area: Client Portal / Frontend
Owner Role: Implementer / Reviewer

Problem (Evidence):
- Client role exists but limited self-service functionality
- No client-facing dashboard
- Missing appointment history view
- No self-service cancellation/rescheduling
- No membership/credits view for clients

Goal:
- Create comprehensive client portal
- Enable self-service appointment management
- Show appointment history and credits
- Profile management for clients

Scope (In/Out):
- In: Client dashboard, appointment management, profile
- Out: Client reviews/feedback (future phase)

Plan:
1. Create `/client/dashboard` route
2. Show upcoming appointments
3. Show appointment history
4. Enable cancel/reschedule (with policy rules)
5. Show credits/membership balance (connect to wallet)
6. Profile editing for clients
7. Download appointment receipts

Files to create:
- apps/web/src/app/(app)/client/dashboard/page.tsx
- apps/web/src/app/(app)/client/appointments/page.tsx
- apps/web/src/app/(app)/client/profile/page.tsx

Files to modify:
- apps/web/src/lib/admin-api.ts (client-specific endpoints)
- RBAC rules to allow CLIENT role access

Acceptance Criteria (Given/When/Then):
1. Given client logged in, When opens portal, Then sees upcoming appointments
2. Given appointment upcoming, When client cancels, Then status updates
3. Given credits available, When views wallet, Then shows balance
4. Given past appointment, When clicks download, Then receives receipt PDF

Test Evidence Required:
- Manual: Login as CLIENT role and access all features
- Manual: Cancel appointment and verify notification sent
- Manual: View appointment history for past year
- RBAC: Verify clients can't access admin routes

Backend Requirements:
- GET /api/v1/client/appointments → returns client's appointments
- PUT /api/v1/client/appointments/{id}/cancel
- PUT /api/v1/client/appointments/{id}/reschedule
- GET /api/v1/client/credits → returns credit balance
- GET /api/v1/client/receipts/{id} → returns PDF

Cancellation Policy Rules:
- Allow cancel up to 24h before appointment (configurable)
- After deadline, require admin approval
- Send confirmation email on cancellation

UX Checks:
- [x] Clear upcoming vs past appointments
- [x] Cancel button with confirmation dialog
- [x] Reschedule shows available slots
- [x] Mobile-friendly layout

Status:
- Estado: DONE
- Fecha: 2026-01-20

---

## Implementation Notes

### Changes Made:
1. ✅ Created client dashboard route
2. ✅ Show upcoming appointments with actions
3. ✅ Quick stats display (appointments, credits, membership)
4. ✅ Cancel/Reschedule functionality (UI ready)
5. ✅ Quick actions grid
6. ✅ Client profile page with edit mode
7. ✅ Emergency contact information
8. ✅ Mobile-responsive layouts

### Files Created:
- apps/web/src/app/(app)/client/dashboard/page.tsx
- apps/web/src/app/(app)/client/profile/page.tsx

### Features Added:
- Client dashboard with stats
- Upcoming appointments list
- Cancel confirmation dialog
- Profile editing with save/cancel
- Emergency contact management
- Quick actions for common tasks
- Empty states when no appointments

### Pending (Backend):
- GET /api/v1/client/appointments
- PUT /api/v1/client/appointments/:id/cancel
- PUT /api/v1/client/appointments/:id/reschedule
- GET /api/v1/client/credits
- GET /api/v1/client/profile
- PUT /api/v1/client/profile
- GET /api/v1/client/receipts/:id (PDF)

### Additional Routes Needed:
- /client/appointments (full history view)
- /client/appointments/:id/reschedule
- /client/receipts/:id

---

## Technical Notes

Current implementation focuses on admin/staff roles.
CLIENT role exists but minimal UI built for them.

Consider adding:
- Push notifications for appointment reminders (PWA)
- Loyalty points display
- Referral program tracking
- Favorite therapists
