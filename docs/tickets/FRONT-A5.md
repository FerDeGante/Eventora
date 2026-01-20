# FRONT-A5 — Frontdesk Day Sheet

Title: Frontdesk Day Sheet
Priority: A
Area: Operations / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- No existe vista resumida diaria para frontdesk (agenda, pendientes, pagos).
- Operación diaria requiere hoja rápida con KPIs y estado de citas.

Goal:
- Crear vista “Day Sheet” con reservas del día, estados y acciones rápidas.

Scope (In/Out):
- In: vista diaria, filtros por sucursal/terapeuta, acciones rápidas.
- Out: cambios en backend.

Plan:
1. Definir layout y data requerida.
2. Consumir endpoints de reservaciones.
3. Añadir filtros y resumen de KPIs.
4. Añadir acciones rápidas (check-in/no-show).

Files touched (expected):
- apps/web/src/app/(app)/dashboard/page.tsx
- apps/web/src/app/(app)/calendar/page.tsx
- apps/web/src/lib/admin-api.ts

Acceptance Criteria (Given/When/Then):
1. Given usuario frontdesk, When abre Day Sheet, Then ve reservas del día.
2. Given filtros, When selecciona sucursal, Then se actualiza la lista.
3. Given acción rápida, When marca check-in, Then status cambia.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: revisión Day Sheet con filtros.

Security & Tenant/RBAC Checks:
- [ ] Solo roles autorizados pueden acceder

UX Checks:
- [ ] Información legible y compacta
- [ ] Acciones rápidas claras

Status:
- Estado: TODO
- Fecha: 2026-01-21
