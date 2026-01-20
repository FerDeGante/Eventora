# ADR-0002: Frontend RBAC guardrails en UI y rutas

## Context
El frontend mostraba rutas y navegación sin validación por rol, permitiendo deep links hacia secciones sensibles y una experiencia inconsistente para RECEPTION/CLIENT.

## Decision
Implementar una matriz de permisos por rol compartida entre UI y middleware, con gating en navegación/CTA y estado “sin acceso” para roles no autorizados.

## Consequences
- Se reduce la exposición visual de secciones sensibles.
- La experiencia es consistente con el modelo RBAC definido en `AI.md`.
- Se agrega lógica compartida de permisos para mantenimiento futuro.

## Alternatives considered
- Confiar solo en guards backend (descartado por UX y exposición visual).
- Hardcodear reglas por página (descartado por mantenimiento).

## References (tickets/docs)
- docs/tickets/T-0012.md
- docs/AI.md
- docs/DECISIONS.md
