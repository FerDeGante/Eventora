# FRONT-B5 — Reports Page Enhancement

Title: Enhance Reports Page with Real-Time Data
Priority: B (Medium Priority - Analytics)
Area: Reports / Analytics / Frontend
Owner Role: Implementer / Reviewer

Problem (Evidence):
- `/reports` page exists but needs better data visualization
- Missing key metrics (no-show rate, therapist utilization)
- No export functionality for reports
- Date range filtering could be improved

Goal:
- Add missing analytics metrics
- Improve chart visualizations
- Add export to CSV/PDF functionality
- Better date range selection UX

Scope (In/Out):
- In: New metrics, export, improved charts
- Out: Predictive analytics (future enhancement)

Plan:
1. Audit existing reports functionality
2. Add missing metrics:
   - No-show rate by service/therapist
   - Therapist utilization percentage
   - Revenue by payment method
   - Client retention rate
3. Implement export to CSV
4. Add print-friendly view
5. Improve date range picker with presets (This Week, This Month, This Quarter)

Files to modify:
- apps/web/src/app/(app)/reports/page.tsx
- apps/web/src/lib/admin-api.ts (add export endpoints)
- Create new chart components if needed

Acceptance Criteria (Given/When/Then):
1. Given reports page, When user views metrics, Then all key metrics display
2. Given date range selected, When clicks export, Then downloads CSV
3. Given report generated, When clicks print, Then opens print-friendly view
4. Given no data for period, When loads, Then shows empty state with helpful message

Test Evidence Required:
- Manual: Generate reports for various date ranges
- Manual: Export and verify CSV format
- Manual: Print and verify formatting

Backend Requirements (if not existing):
- GET /api/v1/reports/export?start={date}&end={date}&format=csv
- GET /api/v1/analytics/no-show-rate
- GET /api/v1/analytics/therapist-utilization

UX Checks:
- [ ] Date range presets (Today, This Week, This Month, Custom)
- [ ] Loading indicators during data fetch
- [ ] Clear axis labels on all charts
- [ ] Tooltips with detailed info on hover

Status:
- Estado: TODO
- Fecha: 2026-01-20

---

## Technical Notes

Current page at `/reports` has basic structure but could be enhanced with:
- More granular breakdowns
- Comparison mode (current vs previous period)
- Drill-down functionality (click service to see details)
- Scheduled reports (email weekly summary)
