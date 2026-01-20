# FRONT-A1 — Multi-Tenant Guards Frontend

Title: Multi-Tenant Guards Frontend
Priority: A
Area: Security / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- Multi-tenant validation existe en backend, pero el frontend no valida `clinicId` ni aplica guards por tenant.
- Riesgo de data leakage si el frontend hace requests sin contexto de tenant.

Goal:
- Asegurar que el frontend deriva `clinicId` del token/sesión y lo envía en cada request, bloqueando navegación si falta tenant.

Scope (In/Out):
- In: TenantContext, header `X-Clinic-Id`/`x-clinic-id`, guard en middleware/UI.
- Out: Cambios en lógica de backend o políticas RLS.

Plan:
1. Crear TenantContext y exponer `clinicId` en providers.
2. Inyectar header de tenant en `apiFetch`/clientes API.
3. Guard en middleware para bloquear rutas si no hay tenant.
4. UX: estado y CTA para seleccionar/activar clínica.
5. Documentar en ticket + decisiones si aplica.

Files touched (expected):
- apps/web/src/app/providers.tsx
- apps/web/src/lib/api-client.ts
- apps/web/middleware.ts
- apps/web/src/app/components (modal selector)

Acceptance Criteria (Given/When/Then):
1. Given usuario sin `clinicId`, When navega a `/dashboard`, Then se bloquea y se redirige a onboarding/selector.
2. Given request a API, When falta `x-clinic-id`, Then backend responde 403.
3. Given usuario con `clinicId`, When navega, Then los requests incluyen header de tenant.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: login sin clinicId → bloqueo; login con clinicId → navegación OK.

Security & Tenant/RBAC Checks:
- [ ] Validación de tenant en requests
- [ ] No permitir navegación sin tenant
- [ ] Headers consistentes

UX Checks:
- [ ] Mensaje claro de bloqueo
- [ ] CTA para seleccionar clínica

Status:
- Estado: TODO
- Fecha: 2026-01-21
