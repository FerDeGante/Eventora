# FRONT-A4 — Instrumentación KPIs (time-to-cash)

Title: Instrumentación KPIs (time-to-cash)
Priority: A
Area: Observability / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- Eventos KPI existen en backend, pero no hay señales UX en frontend para time-to-cash.
- Falta correlación entre booking → pago → check-in desde UI.

Goal:
- Emitir eventos UX para medir time-to-cash, ocupación y no-show.

Scope (In/Out):
- In: eventos en booking, checkout y check-in/no-show.
- Out: almacenamiento analítico backend (solo emitir eventos).

Plan:
1. Definir payload mínimo sin PII.
2. Instrumentar booking y checkout.
3. Instrumentar cambios de status en calendario.
4. Documentar en decisiones.

Files touched (expected):
- apps/web/src/app/book/[slug]/page.tsx
- apps/web/src/app/book/[slug]/checkout/page.tsx
- apps/web/src/app/(app)/calendar/page.tsx

Acceptance Criteria (Given/When/Then):
1. Given usuario inicia booking, When selecciona slot, Then emite `slot_selected`.
2. Given checkout, When crea sesión de pago, Then emite `checkout_started`.
3. Given pago confirmado, When UI recibe éxito, Then emite `payment_completed`.
4. Given frontdesk marca no-show, When cambia status, Then emite `no_show_marked`.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: recorrido booking → checkout → confirmación.

Security & Tenant/RBAC Checks:
- [ ] No enviar PII
- [ ] Incluir clinicId derivado de sesión

UX Checks:
- [ ] Eventos no bloquean UI

Status:
- Estado: DONE (implementado en T-0013)
- Fecha: 2026-01-20

---

## Evidencia de Implementación

Implementado como parte de T-0013. Ver:
- apps/web/src/app/book/[slug]/page.tsx
- apps/web/src/app/book/[slug]/checkout/page.tsx
- apps/web/src/app/(app)/calendar/page.tsx

Eventos UX para KPIs de time-to-cash implementados.
