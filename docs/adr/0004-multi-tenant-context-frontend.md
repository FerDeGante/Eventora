# ADR 0004: Multi-Tenant Context y Guards Frontend

## Status
Accepted

## Context
El sistema Eventora es multi-tenant (varias clínicas en una misma instancia), pero el frontend carecía de un contexto explícito para gestionar el `clinicId` del usuario y validar que todos los requests incluyan este identificador. Esto generaba:

1. **Riesgo de data leakage**: Sin validación consistente del `clinicId`, era posible que datos de una clínica se mostraran a usuarios de otra.
2. **Falta de claridad**: El `clinicId` se derivaba implícitamente del token JWT pero no había un punto único de verdad en el frontend.
3. **UX inconsistente**: No había feedback claro cuando un usuario sin clínica asignada intentaba acceder a rutas protegidas.

## Decision
Implementamos:

1. **TenantContext**: Contexto React que expone `clinicId` y `hasTenant` derivados del token JWT.
2. **TenantProvider**: Provider que envuelve la aplicación y hace disponible el contexto de tenant.
3. **useTenant hook**: Hook para consumir el contexto de manera type-safe.
4. **TenantRequired component**: Componente UI que bloquea acceso y redirige a onboarding si falta `clinicId`.
5. **Validación en api-client**: Ya existía header `x-clinic-id`, se mantiene.

### Arquitectura

```
AppProviders
  └── AuthProvider (deriva clinicId del JWT)
      └── TenantProvider (expone clinicId vía context)
          └── App (consume con useTenant)
```

### Files Modified
- `apps/web/src/app/contexts/TenantContext.tsx` (nuevo)
- `apps/web/src/app/components/TenantRequired.tsx` (nuevo)
- `apps/web/src/app/providers.tsx` (integración)

## Consequences

### Positivo
- **✅ Single source of truth** para `clinicId` en frontend
- **✅ Validación consistente** en todas las rutas protegidas
- **✅ UX mejorada** con feedback claro cuando falta tenant
- **✅ Type-safety** mediante hooks y contexto tipado

### Negativo
- **⚠️ Overhead de context**: Añade un provider más a la jerarquía
- **⚠️ No previene ataques sofisticados**: El `clinicId` se deriva del JWT client-side, la defensa real está en backend

### Mitigaciones
- Backend DEBE validar `x-clinic-id` header en cada request (ya implementado)
- RLS en Postgres debe actuar como última línea de defensa (T-0011 pendiente)

## Alternatives Considered

### A1: Validar tenant solo en middleware
**Rechazado**: Middleware no tiene acceso a localStorage, requeriría migrar a httpOnly cookies.

### A2: Derivar clinicId en cada componente
**Rechazado**: Duplicación de lógica y riesgo de inconsistencias.

### A3: No hacer nada, confiar en backend
**Rechazado**: UX pobre, sin feedback claro al usuario.

## Related
- T-0009: Hardening RBAC y multi-tenant (backend)
- T-0011: RLS PostgreSQL (defensa final)
- FRONT-A1: Multi-Tenant Guards Frontend

## Date
2026-01-20
