# T-0010 — QA e2e + Observabilidad para lanzamiento

## Contexto
- Problema: No hay evidencia automatizada de flujo end-to-end (reserva → pago → check-in) ni verificación de observabilidad activa (Sentry/health), lo que pone en riesgo el DoD de lanzamiento.
- Por qué importa (KPI impactado): garantiza time-to-cash y ocupación sin fallas ocultas; reduce no-shows al asegurar recordatorios/confirmaciones.
- Usuarios afectados (rol): CLIENT (booking/pago), RECEPTION/THERAPIST (check-in), ADMIN/MANAGER (visibilidad de errores).

## Alcance
- Incluye: pruebas e2e o integración que cubran reserva + pago (Stripe test) + check-in; validación de emails disparados; verificación de Sentry y health endpoints; documentación de cómo correr las pruebas.
- No incluye: cambios de UI, diseño de nuevos dashboards.

## Criterios de aceptación (exactos)
1) Prueba automatizada (Playwright o Vitest API) que crea una reserva, procesa pago test (Stripe) y registra check-in, usando datos de demo/seed.
2) Verificación en prueba de que se genera al menos un email de confirmación (mock o API de Resend en modo test).
3) Healthcheck/observabilidad validados: `/health` responde OK y Sentry captura mensaje de prueba (o se mockea y se asserta la llamada); comandos de ejecución documentados.

## Plan (lo llena el agente antes de codear)
- [x] Preparar datos/fixtures de demo para e2e (cliente, servicio, horario, clinicId).
- [x] Escribir flujo automatizado reserva → pago test → check-in.
- [x] Mockear/verificar envío de email (Resend) en test.
- [x] Añadir assertions para healthcheck y captura Sentry de prueba.
- [x] Documentar cómo correr las pruebas y evidencia en el ticket.

## Implementación
### Files touched
- apps/api/test/modules/e2e/booking-flow.test.ts
- apps/api/test/setup.ts
- docs/tickets/0010-QA-Observability-Launch.md

### Test evidence
- Unit/integration: `npm run test --workspace api -- booking-flow.test.ts`
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
- Stripe test requiere claves test y manejo de webhooks simulados; podría usarse modo mock.

## Status
- Estado: DONE
- Owner (agente): Codex
- Fecha: 2026-01-19
