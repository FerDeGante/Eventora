# T-0008 — Alinear README y ROADMAP con el estado real

## Contexto
- Problema: README y ROADMAP no reflejan el stack real (Fastify API + Next.js web), el RBAC vigente (`ADMIN`, `MANAGER`, `RECEPTION`, `THERAPIST`, `CLIENT`) ni las rutas de documentación/tickets, lo que genera riesgo de mal entendidos y tickets mal formados.
- Por qué importa (KPI impactado): claridad operativa y velocidad de ejecución (reduce retrabajo y errores que afectan time-to-cash y ocupación).
- Usuarios afectados (rol): equipo interno (agentes AI, devs, QA).

## Alcance
- Incluye: actualizar README con stack, roles y variables de entorno reales; alinear la sección de sistema de ejecución; refrescar ROADMAP con plan accionable y nuevos tickets derivados.
- No incluye: cambios de código en API o frontend; ajustes en modelo de datos.

## Criterios de aceptación (exactos)
1) README lista roles reales, stack real (Fastify API + Next.js web) y variables de entorno requeridas; paths de docs/tickets correctos.
2) ROADMAP actualizado con hitos y tareas accionables, referenciando nuevos tickets.
3) Tickets nuevos creados con plan y estado TODO para las acciones derivadas.

## Plan (lo llena el agente antes de codear)
- [x] Auditar README actual vs stack y RBAC real.
- [x] Redactar README actualizado (roles, stack, env, sistema de ejecución).
- [x] Redactar ROADMAP con plan y mapping a tickets nuevos.
- [x] Crear tickets derivados con criterios de aceptación y plan.
- [x] Registrar files touched y evidencias en este ticket.

## Implementación
### Files touched
- README.md
- docs/ROADMAP.md
- docs/tickets/0008-Docs-Alignment.md
- docs/tickets/0009-RBAC-Multitenant-Hardening.md
- docs/tickets/0010-QA-Observability-Launch.md

### Test evidence
- Unit/integration: N/A (solo documentación)
- Manual flow tested: N/A
- Capturas/logs (si aplica): N/A

### Security checks
- [ ] Validación server-side
- [ ] Tenant guard
- [ ] RBAC
- [ ] Webhook signature (si aplica)
- [ ] Rate limit (si aplica)

### UX checks
- [ ] Tokens/consistencia
- [ ] Estados vacíos
- [ ] Loading/skeleton
- [ ] Accesibilidad (focus/aria)

## Riesgos / notas
- Ninguno técnico; trabajo de documentación.

## Status
- Estado: DONE
- Owner (agente): Codex
- Fecha: 2026-01-19
