# FRONT-B2 — Dashboard Improved Charts (Connect Real Data)

Title: Connect Improved Dashboard Charts to Backend Analytics
Priority: B (High Priority - Post-MVP)
Area: Dashboard / Analytics / Frontend
Owner Role: Implementer / Reviewer

Problem (Evidence):
- `/dashboard-improved` page uses mock chart data
- ReservationsChart and RevenueChart show fake trends
- No connection to actual reservation/revenue metrics
- Analytics not reflecting real business performance

Goal:
- Connect charts to backend analytics endpoints
- Display real reservation trends and revenue data
- Enable date range filtering with actual data

Scope (In/Out):
- In: Replace mock data with API calls, connect date range picker
- Out: New chart types (existing charts sufficient)

Plan:
1. Create analytics endpoints in backend (or verify existing)
2. Replace mockReservationsData with API call
3. Replace mockRevenueData with API call
4. Connect DateRangePicker to API queries
5. Add loading states for charts

Files to modify:
- apps/web/src/app/(app)/dashboard-improved/page.tsx
- apps/web/src/app/components/dashboard/Charts.tsx (if needed)
- apps/web/src/lib/admin-api.ts (add analytics endpoints)

Acceptance Criteria (Given/When/Then):
1. Given dashboard loads, When charts render, Then shows real data
2. Given date range selected, When user changes dates, Then charts update
3. Given no data for range, When query returns empty, Then shows empty state

Test Evidence Required:
- Manual: Load dashboard, change date ranges, verify data accuracy
- API: Verify analytics endpoints called with correct date params

Backend Requirements:
- GET /api/v1/analytics/reservations?start={date}&end={date}
  - Returns: { date, reservations, completed, cancelled }[]
- GET /api/v1/analytics/revenue?start={date}&end={date}
  - Returns: { period, stripe, pos, cash }[]

Status:
- Estado: TODO
- Fecha: 2026-01-20

---

## Technical Notes

Current mock data (lines 10-27):
```typescript
const mockReservationsData = [
  { date: '24 Nov', reservations: 45, completed: 38, cancelled: 5 },
  ...
];

const mockRevenueData = [
  { period: 'Sem 1', stripe: 142000, pos: 58000, cash: 23000 },
  ...
];
```

Replace with React Query hooks for real-time data.
