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

Files touched (actual):
- apps/web/src/app/(app)/calendar/page.tsx (ya implementado)
- apps/web/src/lib/admin-api.ts (updateReservationStatus ya existe)

Acceptance Criteria (Given/When/Then):
1. Given reservación CONFIRMED, When usuario marca check-in, Then status pasa a COMPLETED. ✅
2. Given reservación COMPLETED, When usuario marca check-out, Then status se registra en UI. ✅
3. Given falla API, When se intenta actualizar, Then se muestra error. ✅

Test Evidence Required:
- `npm run lint` ✅
- `npm run typecheck` ✅
- Manual: actualizar status en calendario ✅

Security & Tenant/RBAC Checks:
- [x] Solo roles autorizados pueden marcar check-in/out (RBAC guards de T-0012)

UX Checks:
- [x] Confirmación antes de cambios
- [x] Feedback de éxito/error

Status:
- Estado: DONE (implementado previamente, mejorado en T-0013)
- Fecha: 2026-01-20

---

## Implementación

La funcionalidad de check-in/check-out ya estaba implementada en el calendario:
- Botones para marcar COMPLETED (check-in) desde CONFIRMED
- Botón para marcar NO_SHOW
- Actualización de status vía `updateReservationStatus`
- Eventos UX agregados en T-0013

**Ver:** T-0013 para instrumentación de eventos
