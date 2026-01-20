# T-0005 — Credits & Ledger (Paquetes)

## Contexto
- **Problema:** Clientes compran paquetes de sesiones que se consumen
- **Por qué importa (KPI):** Retención, Time-to-cash
- **Usuarios afectados:** CLIENT, RECEPTION

## Alcance
### Incluye
- Paquetes de créditos (N sesiones)
- Ledger de consumo
- Expiración de paquetes
- Consumo automático en reserva
- Restauración en cancelación

### No incluye
- Paquetes compartidos entre usuarios
- Transferencia de créditos

## Criterios de aceptación
1. ✅ Admin puede crear paquete (10 sesiones, válido 3 meses)
2. ✅ Cliente puede comprar paquete
3. ✅ Reserva consume sesión automáticamente
4. ✅ Cancelación restaura sesión
5. ✅ Paquete expira correctamente

## Plan
- [x] Modelo Package en Prisma
- [x] Modelo UserPackage (paquete vendido)
- [x] CRUD paquetes
- [x] Endpoint comprar paquete
- [x] Lógica de consumo en reservación
- [x] Lógica de restauración en cancelación

## Implementación

### Files touched
- `prisma/schema.prisma` (Package, UserPackage)
- `apps/api/src/modules/catalog/package.routes.ts`
- `apps/api/src/modules/catalog/package.service.ts`
- `apps/api/src/modules/reservations/reservation.service.ts`

### Test evidence
- Manual: Comprar paquete → reservar → ver sesiones restantes
- Manual: Cancelar → ver sesión restaurada

### Security checks
- [x] Validar propiedad del paquete
- [x] Tenant isolation
- [x] No sobreventa

### UX checks
- [x] Mostrar sesiones restantes
- [x] Alerta cuando pocas sesiones
- [ ] UI de paquetes (pendiente)

## Status
- **Estado:** ✅ DONE (Backend)
- **UI:** ⚠️ Pendiente página /packages admin
- **Owner:** Packages module
- **Fecha:** Enero 2026
