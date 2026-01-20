# ADR 0005: Frontdesk Day Sheet Component

## Status
Accepted

## Context
El dashboard tenía un timeline general, pero frontdesk necesitaba una vista más operativa con:
- Filtros por sucursal y terapeuta
- Acciones rápidas (check-in, cobrar)
- Estados visuales claros
- KPIs resumidos del día

## Decision
Reutilizar el timeline existente del dashboard y agregar:
1. Componente `DaySheetFilter` para filtros
2. Acciones rápidas en cada reserva
3. Resumen de KPIs específicos del día

### Implementación
- El timeline ya existe en dashboard
- Se puede acceder vía `/dashboard` con permisos de RECEPTION/ADMIN
- Los filtros y acciones se pueden agregar incrementalmente según necesidad

## Consequences

### Positivo
- ✅ Reutiliza componente existente
- ✅ Menos código nuevo
- ✅ Consistencia visual

### Negativo
- ⚠️ No es una ruta dedicada `/frontdesk`
- ⚠️ Filtros requieren refactorización del timeline

## Alternatives Considered

### A1: Ruta dedicada /frontdesk
**Rechazado por ahora**: El dashboard actual cumple el propósito básico.

### A2: Vista modal sobre calendario
**Rechazado**: Más complejidad innecesaria.

## Related
- FRONT-A5: Frontdesk Day Sheet
- FRONT-A3: Check-in/Check-out Flow (ya implementado)

## Date
2026-01-20

## Note
Este ADR marca FRONT-A5 como **parcialmente completado** porque el timeline existe pero no tiene filtros avanzados. Se puede completar en iteraciones futuras.
