# FRONT-A7 — Wallet / Credits Balance View

Title: Wallet / Credits Balance View
Priority: A
Area: Billing / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- El backend maneja créditos/membresías, pero no hay vista de balance para usuarios.
- Falta transparencia sobre consumo y expiraciones.

Goal:
- Mostrar balance de créditos y movimientos relevantes en UI.

Scope (In/Out):
- In: vista de balance, consumos, expiraciones, filtros básicos.
- Out: cambios de backend o ledger.

Plan:
1. Definir layout de balance y lista de movimientos.
2. Consumir endpoints de créditos.
3. Agregar filtros por fechas/tipo.
4. Mostrar mensajes de estado (sin créditos, expirado).

Files touched (expected):
- apps/web/src/app/(app)/memberships/page.tsx
- apps/web/src/app/(app)/clients/page.tsx
- apps/web/src/lib/admin-api.ts

Acceptance Criteria (Given/When/Then):
1. Given usuario con créditos, When abre balance, Then ve total disponible.
2. Given consumos, When filtra por fecha, Then se actualiza la lista.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: revisar balance con datos reales.

Security & Tenant/RBAC Checks:
- [ ] Solo roles autorizados ven balances

UX Checks:
- [ ] Estado vacío con CTA
- [ ] Datos legibles

Status:
- Estado: DEFERRED (requiere endpoints de ledger y membresías)
- Fecha: 2026-01-20

---

## Razón de Defer

La vista de Wallet requiere:
1. Endpoints backend para ledger de créditos
2. Lógica de consumo y expiraciones
3. Historial de movimientos

**Prioridad:** P1 (importante para transparencia de créditos)
**Siguiente paso:** Verificar endpoints existentes en T-0005 (Credits Ledger)

**Ver:** ROADMAP.md - Sprint 2
