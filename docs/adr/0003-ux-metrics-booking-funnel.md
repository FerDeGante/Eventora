# ADR-0003: UX metrics para Booking → Checkout → Check-in

## Context
El funnel público (booking/checkout) y las acciones de check-in/no-show no emitían eventos KPI, lo que impedía medir ocupación, time-to-cash y no-show desde UI.

## Decision
Instrumentar eventos UX mínimos con `useUxMetrics` en selección de servicio/slot, inicio de pago y actualización de status (check-in/no-show), usando payloads sin PII y con IDs/timestamps.

## Consequences
- Se habilita medición del funnel en observabilidad.
- Eventos estandarizados listos para analítica sin exponer datos sensibles.

## Alternatives considered
- Instrumentación solo en backend (descartado por falta de señales de UX).
- Agregar tracking con SDK externo (descartado por scope MVP).

## References (tickets/docs)
- docs/tickets/T-0013.md
- docs/AI.md
- docs/DECISIONS.md
