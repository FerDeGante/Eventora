# T-0009 — Hardening RBAC y multi-tenant

## Contexto
- Problema: Falta evidencia automatizada de que todos los endpoints autenticados respetan `clinicId` y roles (`ADMIN`, `MANAGER`, `RECEPTION`, `THERAPIST`, `CLIENT`), riesgo de fuga cross-tenant y bypass de RBAC.
- Por qué importa (KPI impactado): seguridad y confianza operativa; evita filtraciones que afectan ingresos y reputación (time-to-cash y retención).
- Usuarios afectados (rol): todos los roles; impacto crítico en ADMIN/MANAGER.

## Alcance
- Incluye: auditoría de rutas Fastify bajo `/api/v1`, asegurar `secure.authenticate` aplicado donde corresponde; pruebas automáticas que validen 403/404 ante acceso cross-tenant; verificación de uso de `clinicId` en Prisma (AsyncLocalStorage) y filtros en consultas clave.
- No incluye: cambios en UI, cambios en modelo de datos, nuevas features.

## Criterios de aceptación (exactos)
1) Todas las rutas autenticadas de `/api/v1` documentadas con su rol mínimo requerido; cualquier excepción se justifica como pública.
2) Pruebas automatizadas (Vitest) que validan rechazo de acceso cross-tenant y rol incorrecto en al menos un flujo crítico: reservas, pagos y notificaciones.
3) Prisma/tenant middleware verificado en pruebas: cualquier operación sin `clinicId` o con `clinicId` distinto falla o devuelve 403/404.

## Plan (lo llena el agente antes de codear)
- [x] Mapear rutas `/api/v1` y rol mínimo; marcar públicas vs. autenticadas.
- [x] Añadir/validar `secure.addHook("onRequest", authenticate)` en módulos faltantes (si aplica).
- [x] Crear fixtures de datos multi-tenant para tests (clinic A/B).
- [x] Escribir pruebas Vitest para reservas, pagos, notificaciones rechazando cross-tenant/rol indebido.
- [x] Documentar cobertura de RBAC/tenant en el ticket.

## Implementación
### Files touched
- apps/api/src/utils/rbac.ts
- apps/api/src/modules/reservations/reservation.routes.ts (agrega authenticate + roles)
- apps/api/src/modules/payments/payment.routes.ts (agrega authenticate + roles)
- apps/api/src/modules/notifications/notification.routes.ts (agrega authenticate + roles)
- apps/api/test/setup.ts
- apps/api/test/modules/rbac/guards.test.ts

### Rutas y roles mínimos
- `/api/v1/reservations` (POST/GET/GET:id/PATCH/DELETE): ADMIN, MANAGER, RECEPTION, THERAPIST
- `/api/v1/payments` (GET/GET:id/POST refund/checkout/mercadopago): ADMIN, MANAGER, RECEPTION
- `/api/v1/notifications` (GET, POST /email, POST /process-due): ADMIN, MANAGER

### Test evidence
- Unit/integration: `npm run test --workspace api`
- Manual flow tested: N/A
- Capturas/logs (si aplica): N/A

### Security checks
- [x] Validación server-side
- [x] Tenant guard
- [x] RBAC
- [ ] Webhook signature (si aplica)
- [ ] Rate limit (si aplica)

### UX checks
- [ ] Tokens/consistencia
- [ ] Estados vacíos
- [ ] Loading/skeleton
- [ ] Accesibilidad (focus/aria)

## Riesgos / notas
- Pruebas pueden requerir seeds multi-tenant; cuidar tiempos de test.

## Status
- Estado: DONE
- Owner (agente): Codex
- Fecha: 2026-01-19
