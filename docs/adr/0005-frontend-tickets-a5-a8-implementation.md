# ADR-0005: Frontend Implementation for Tickets A5-A8

**Date:** 2026-01-20  
**Status:** Accepted  
**Decision Makers:** Development Team  
**Related Tickets:** FRONT-A5, FRONT-A6, FRONT-A7, FRONT-A8

---

## Context

After completing FRONT-A1 to A4, we needed to implement the remaining frontend priority tickets (A5-A8) to provide complete operational tools for frontdesk staff, service management, and client wallet visibility. These tickets were initially marked as deferred due to perceived backend dependencies, but we realized we could implement full frontend UIs with mock data that would be ready to connect to backend APIs when available.

### Tickets Addressed:
- **FRONT-A5:** Frontdesk Day Sheet with filters and quick actions
- **FRONT-A6:** Service capacity field for group classes
- **FRONT-A7:** Wallet/Credits balance view
- **FRONT-A8:** Waitlist management UI

---

## Decision

We decided to **fully implement all frontend UIs for tickets A5-A8** with:

1. **Complete component architecture** with TypeScript types
2. **Mock data** that matches expected backend API structure
3. **Functional UIs** that provide full user interactions
4. **Prepared integration points** for backend connection

This approach allows:
- Frontend development to proceed independently
- Early UX validation with stakeholders
- Parallel backend development
- Easy backend integration (just swap mock data for API calls)

---

## Implementation Details

### FRONT-A5: Day Sheet Enhancement

**Components Created:**
- `DaySheetContainer.tsx` - Main container with state management
- `DaySheetFilters.tsx` - Filter controls (date, branch, therapist, status)
- `DaySheetActions.tsx` - Quick action buttons per reservation

**Features:**
- Real-time KPIs (total, scheduled, checked-in, completed, no-show, occupancy%)
- Filters that reactively update timeline
- Inline actions: check-in, mark no-show, complete, cancel
- Optimistic UI updates
- Uses existing `updateReservationStatus` API

**Integration:** Embedded in dashboard page

---

### FRONT-A6: Service Capacity

**Modified Files:**
- `apps/web/src/lib/admin-api.ts` - Added `capacity` field to Service type
- `apps/web/src/app/(app)/services/page.tsx` - Added capacity input and display column

**Features:**
- Optional numeric field in service form
- `null` = 1-on-1 service (individual)
- `number` = group class with capacity N
- Visual display in services table
- Included in create/update payloads

**Backend Requirement:** Add `capacity` field to Service model (nullable integer)

---

### FRONT-A7: Wallet View

**Component Created:**
- `apps/web/src/app/(app)/wallet/page.tsx` - Full wallet page

**Features:**
- Balance cards (available, total, expiring soon)
- Movement history with filtering
- Movement types: purchase, usage, expiration, refund
- Visual distinction by type (colors, icons)
- Empty state with CTA
- Mock data structured to match expected ledger API

**Backend Requirement:** Ledger endpoints (T-0005) for:
- GET /api/v1/credits/balance
- GET /api/v1/credits/movements

---

### FRONT-A8: Waitlist Management

**Components Created:**
- `WaitlistPanel.tsx` - Reusable waitlist component
- `apps/web/src/app/(app)/waitlist/page.tsx` - Full management page

**Features:**
- Add clients to waitlist (name, email, phone)
- Priority ordering
- Status tracking (waiting, notified, confirmed, expired)
- Notify actions
- Remove from waitlist
- Service-level overview
- Capacity indicators

**Backend Requirement:** Waitlist model and endpoints:
- POST /api/v1/waitlist
- DELETE /api/v1/waitlist/:id
- POST /api/v1/waitlist/:id/notify

---

## Consequences

### Positive
- ✅ All frontend P0 tickets now complete (A1-A8)
- ✅ UX validation can proceed with stakeholders
- ✅ Backend team has clear API contracts
- ✅ Frontend and backend can develop in parallel
- ✅ Easy integration path (swap mock data for API calls)
- ✅ TypeScript ensures type safety at integration time

### Negative
- ⚠️ Components use mock data until backend is ready
- ⚠️ Need to update mock data if API contracts change
- ⚠️ Some features incomplete without backend (e.g., booking wizard capacity validation)

### Neutral
- 📝 Backend tickets clearly identified (Sprint 2-3)
- 📝 Integration testing required when backend is ready
- 📝 Mock data provides clear examples of expected structure

---

## Alternatives Considered

### 1. Wait for Backend (Original Plan)
**Rejected:** Would block frontend progress and delay UX validation

### 2. Implement Minimal Placeholders
**Rejected:** Wouldn't allow meaningful UX testing or stakeholder feedback

### 3. Implement Full UIs with Mock Data (CHOSEN)
**Accepted:** Best balance of progress, validation, and parallel development

---

## Migration Notes

### Backend Integration Checklist

**FRONT-A5 (Day Sheet):**
- ✅ Already uses real API (`updateReservationStatus`)
- Filters work with any data source

**FRONT-A6 (Capacity):**
1. Add `capacity: number | null` to Service model
2. Update Prisma schema
3. Run migration
4. Test create/update service endpoints

**FRONT-A7 (Wallet):**
1. Implement ledger endpoints (T-0005)
2. Replace mock data in wallet page:
   ```typescript
   const [balance] = useState<CreditBalance>(await getCreditBalance());
   const [movements] = useState<CreditMovement[]>(await getCreditMovements());
   ```

**FRONT-A8 (Waitlist):**
1. Create Waitlist model in database
2. Implement CRUD endpoints
3. Replace mock data in WaitlistPanel:
   ```typescript
   const [waitlist] = useState<WaitlistEntry[]>(await getWaitlist(serviceId));
   ```

---

## Related ADRs
- ADR-0004: Multi-Tenant Context Frontend
- ADR-0002: RBAC Implementation (T-0012)
- ADR-0003: KPI Instrumentation (T-0013)

---

## Notes
- All components follow existing design system patterns
- TypeScript types match expected backend structures
- Mock data is realistic and sufficient for demo/testing
- Components are production-ready except for backend integration
