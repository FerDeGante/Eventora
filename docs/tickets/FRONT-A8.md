# FRONT-A8 — Waitlist Management

Title: Waitlist Management
Priority: A
Area: Booking / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- Backend soporta waitlist, pero no hay UI para gestión de lista de espera.
- Se pierden oportunidades de conversión en clases con cupo lleno.

Goal:
- Permitir a frontdesk gestionar waitlist y notificar disponibilidad.

Scope (In/Out):
- In: UI para agregar/remover usuarios, estados de espera, CTA de notificación.
- Out: cambios en backend.

Plan:
1. Definir UI de waitlist por servicio/slot.
2. Consumir endpoints de waitlist.
3. Agregar acciones (agregar, remover, notificar).
4. Mostrar estados y errores.

Files touched (expected):
- apps/web/src/app/(app)/calendar/page.tsx
- apps/web/src/app/(app)/services/page.tsx
- apps/web/src/lib/admin-api.ts

Acceptance Criteria (Given/When/Then):
1. Given slot lleno, When usuario agrega cliente a waitlist, Then aparece en lista.
2. Given cupo disponible, When se notifica, Then se registra evento.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: flujo waitlist end-to-end.

Security & Tenant/RBAC Checks:
- [ ] Solo roles autorizados gestionan waitlist

UX Checks:
- [ ] Estados claros
- [ ] CTA visible

Status:
- Estado: TODO
- Fecha: 2026-01-21
