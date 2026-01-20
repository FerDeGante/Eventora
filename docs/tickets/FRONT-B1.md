# FRONT-B1 — Admin Reservations Management (Remove Mock Data)

Title: Connect Admin Reservations Management to Real API
Priority: B (High Priority - Post-MVP)
Area: Admin / Frontend
Owner Role: Implementer / Reviewer

Problem (Evidence):
- `/admin/reservations-management` page uses hardcoded mock data
- No connection to backend reservations API
- Filters and search don't work with real data
- Page is isolated from actual reservation system

Goal:
- Connect admin reservations management to real backend API
- Enable full CRUD operations on reservations
- Integrate with existing reservation system

Scope (In/Out):
- In: Replace mock data with API calls, add pagination, connect filters
- Out: New reservation features (existing elsewhere in calendar)

Plan:
1. Review existing reservation endpoints in admin-api.ts
2. Replace mockReservations with API call
3. Connect filters to backend query params
4. Add pagination support
5. Test with real reservation data

Files to modify:
- apps/web/src/app/(app)/admin/reservations-management/page.tsx
- apps/web/src/lib/admin-api.ts (if new endpoints needed)

Acceptance Criteria (Given/When/Then):
1. Given admin opens reservations management, When page loads, Then real reservations display
2. Given filters applied, When user selects date/status, Then API queries with filters
3. Given many reservations, When user paginate, Then loads next page

Test Evidence Required:
- Manual: Load page with >20 reservations, test filters and pagination
- API: Verify correct endpoints called with proper params

Status:
- Estado: TODO
- Fecha: 2026-01-20

---

## Technical Notes

Current mock data structure (lines 19-25):
```typescript
const mockReservations: Reservation[] = [
  { id: 'RES-001', date: '2025-11-30', time: '09:00', ... },
  ...
];
```

Replace with:
```typescript
const { data: reservations, isLoading } = useQuery({
  queryKey: ['reservations', filters],
  queryFn: () => getReservations(filters),
});
```

**Backend dependency:** Verify `/api/v1/reservations` endpoint with filter support
