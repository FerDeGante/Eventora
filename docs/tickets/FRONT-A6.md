# FRONT-A6 — Booking Wizard - Capacidad N (Clases)

Title: Booking Wizard - Capacidad N (Clases)
Priority: A
Area: Booking / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- La capacidad por servicio (clases N) existe en backend, pero no hay UI para configurarla.
- KPIs de ocupación dependen de esta capacidad.

Goal:
- Permitir configurar capacidad por servicio y reflejarlo en booking wizard.

Scope (In/Out):
- In: campo de capacidad en UI de servicios, validaciones y render en booking.
- Out: cambios de modelo de datos backend.

Plan:
1. Añadir campo de capacidad en UI de servicios.
2. Validar capacidad y persistir.
3. Adaptar booking wizard para clases N.
4. Actualizar documentación de KPIs.

Files touched (expected):
- apps/web/src/app/(app)/services/page.tsx
- apps/web/src/app/book/[slug]/page.tsx
- apps/web/src/lib/admin-api.ts

Acceptance Criteria (Given/When/Then):
1. Given servicio tipo clase, When define capacidad, Then se guarda correctamente.
2. Given booking clase, When se muestran slots, Then respeta capacidad.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: crear servicio con capacidad y reservar.

Security & Tenant/RBAC Checks:
- [ ] Solo roles autorizados pueden editar capacidad

UX Checks:
- [ ] Campo de capacidad claro
- [ ] Mensajes de validación

Status:
- Estado: TODO
- Fecha: 2026-01-21
