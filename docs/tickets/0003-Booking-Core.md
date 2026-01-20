# T-0003 — Booking Core

## Contexto
- **Problema:** Los clientes necesitan poder reservar servicios
- **Por qué importa (KPI):** Ocupación, Time-to-cash
- **Usuarios afectados:** CLIENT, RECEPTION, THERAPIST

## Alcance
### Incluye
- Servicios (CLASE/SESIÓN)
- Disponibilidad con templates
- Crear reserva con validación de conflictos
- Estados de reserva
- Check-in/check-out
- Wizard de booking (UI)

### No incluye
- Pagos (ver T-0004)
- Waitlist
- Reservas recurrentes

## Criterios de aceptación
1. ✅ Cliente puede ver servicios disponibles
2. ✅ Cliente puede ver slots de disponibilidad
3. ✅ Cliente puede crear reserva
4. ✅ Sistema detecta conflictos de horario
5. ✅ Reception puede hacer check-in

## Plan
- [x] CRUD servicios
- [x] CRUD categorías
- [x] Templates de disponibilidad
- [x] Excepciones de disponibilidad
- [x] Crear reserva con validación
- [x] Estados: PENDING → CONFIRMED → COMPLETED
- [x] Check-in endpoint
- [x] Wizard UI

## Implementación

### Files touched
- `apps/api/src/modules/catalog/*`
- `apps/api/src/modules/availability/*`
- `apps/api/src/modules/reservations/*`
- `apps/web/src/app/(app)/wizard/page.tsx`
- `apps/web/src/lib/public-api.ts`

### Test evidence
- Unit: `test/modules/catalog.test.ts`
- Unit: `test/modules/reservations.test.ts`
- Manual: Flujo completo en wizard

### Security checks
- [x] Validación de disponibilidad real
- [x] No double-booking
- [x] Rate limit en crear reserva (10/min)
- [x] Tenant isolation

### UX checks
- [x] Wizard por pasos claro
- [x] Feedback de selección
- [x] Loading states
- [x] Error handling

## Status
- **Estado:** ✅ DONE
- **Owner:** Booking module
- **Fecha:** Enero 2026
