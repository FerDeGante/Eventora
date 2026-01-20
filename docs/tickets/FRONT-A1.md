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

Files touched (actual):
- apps/web/src/app/contexts/TenantContext.tsx (nuevo)
- apps/web/src/app/components/TenantRequired.tsx (nuevo)
- apps/web/src/app/providers.tsx (integración)
- apps/web/src/lib/api-client.ts (ya existía header x-clinic-id)

Test Evidence Required:
- `npm run lint` ✅
- `npm run typecheck` ✅
- Manual: TenantContext funcional, header enviado en requests

Security & Tenant/RBAC Checks:
- [x] Validación de tenant en requests
- [x] No permitir navegación sin tenant (mediante TenantRequired)
- [x] Headers consistentes

UX Checks:
- [x] Mensaje claro de bloqueo
- [x] CTA para seleccionar clínica

Status:
- Estado: DONE
- Fecha: 2026-01-20

---

## Implementación

### TenantContext
Contexto React que deriva `clinicId` del JWT vía useAuth y lo expone mediante `useTenant` hook.

### TenantRequired Component
Bloquea acceso y redirige a onboarding si falta `clinicId`.

### Integración
TenantProvider envuelve la app en providers.tsx, disponible globalmente.

**Ver:** ADR-0004, DECISIONS.md
