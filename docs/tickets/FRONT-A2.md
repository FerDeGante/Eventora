# FRONT-A2 — RBAC Visual Completo

Title: RBAC Visual Completo
Priority: A
Area: Security / Frontend
Owner Role: Planner / Implementer / Reviewer / QA

Problem (Evidence):
- Guards de roles existen en backend, pero UI no adapta navegación/CTAs por rol.
- Riesgo de exposición visual y confusión de permisos.

Goal:
- Ocultar o deshabilitar UI y rutas sensibles según rol, con feedback claro.

Scope (In/Out):
- In: matriz de permisos por rol, guard en rutas, gating de navegación/CTA.
- Out: cambios en JWT o RBAC backend.

Plan:
1. Definir matriz por rol para rutas y features.
2. Aplicar guard en layout App Router.
3. Ocultar items de navegación según rol.
4. Estado “sin acceso” con CTA.
5. Documentar cambios.

Files touched (expected):
- apps/web/src/app/components/shell/AppChrome.tsx
- apps/web/src/app/hooks/useAuth.tsx
- apps/web/middleware.ts
- apps/web/src/app/components/AccessDenied.tsx

Acceptance Criteria (Given/When/Then):
1. Given RECEPTION, When visita `/settings`, Then muestra estado “sin acceso”.
2. Given CLIENT, When abre `/reports`, Then redirige a `/dashboard` con mensaje.
3. Given ADMIN, When abre rutas protegidas, Then acceso normal.
4. Given cualquier rol, When renderiza sidebar, Then ve solo secciones permitidas.

Test Evidence Required:
- `npm run lint`
- `npm run typecheck`
- Manual: login con ADMIN/RECEPTION/CLIENT y validar rutas/nav.

Security & Tenant/RBAC Checks:
- [ ] Validación de rol por ruta
- [ ] Guard para deep links
- [ ] No exponer UI sensible

UX Checks:
- [ ] Mensaje “sin acceso” claro
- [ ] CTA de retorno

Status:
- Estado: DONE (implementado en T-0012)
- Fecha: 2026-01-20

---

## Evidencia de Implementación

Implementado como parte de T-0012. Ver:
- apps/web/src/lib/rbac.ts
- apps/web/src/app/components/AccessDenied.tsx
- apps/web/src/app/components/shell/AppChrome.tsx
- apps/web/middleware.ts

Funcionalidad completa de RBAC visual con guards, matriz de permisos y feedback.
