# FRONT-A3 — Check-in / Check-out Flow

Title: Check-in / Check-out Flow
Priority: A
Area: Operations / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- El backend permite actualizar status, pero la UI no tiene flujo completo de check-in/check-out.
- No se registran marcas de check-in/out para KPIs de no-show.

Goal:
- Implementar flujo de check-in/check-out en calendario y/o detalle de reservación.

Scope (In/Out):
- In: UI para marcar check-in/out, estado en calendario, confirmaciones.
- Out: cambios en backend de status.

Plan:
1. Definir estados y CTAs para check-in/out.
2. Implementar acciones en modal de reservación.
3. Refrescar data tras cambios.
4. Emitir eventos UX si aplica.

Files touched (expected):
- apps/web/src/app/(app)/calendar/page.tsx
- apps/web/src/lib/admin-api.ts

Acceptance Criteria (Given/When/Then):
1. Given reservación CONFIRMED, When usuario marca check-in, Then status pasa a COMPLETED.
2. Given reservación COMPLETED, When usuario marca check-out, Then status se registra en UI.
3. Given falla API, When se intenta actualizar, Then se muestra error.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: actualizar status en calendario.

Security & Tenant/RBAC Checks:
- [ ] Solo roles autorizados pueden marcar check-in/out

UX Checks:
- [ ] Confirmación antes de cambios
- [ ] Feedback de éxito/error

Status:
- Estado: TODO
- Fecha: 2026-01-21
