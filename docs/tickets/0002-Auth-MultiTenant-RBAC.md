# T-0002 — Auth + Multi-Tenant + RBAC

## Contexto
- **Problema:** Necesitamos autenticación segura con soporte multi-tenant
- **Por qué importa:** Seguridad y aislamiento de datos entre clínicas
- **Usuarios afectados:** Todos los roles

## Alcance
### Incluye
- Login con email/password
- 2FA vía email
- JWT con expiración
- Multi-tenant con clinicId
- RBAC (5 roles)
- Rate limiting en auth

### No incluye
- OAuth (Google, Apple)
- SSO empresarial

## Criterios de aceptación
1. ✅ Usuario puede registrarse
2. ✅ Usuario puede hacer login
3. ✅ 2FA funciona vía email
4. ✅ Token JWT tiene clinicId
5. ✅ Rate limit bloquea después de 5 intentos

## Plan
- [x] Endpoint POST /auth/register
- [x] Endpoint POST /auth/login
- [x] Endpoint POST /auth/two-factor/verify
- [x] Endpoint POST /auth/password/request
- [x] Endpoint POST /auth/password/reset
- [x] Middleware authenticate
- [x] Rate limiting con Upstash

## Implementación

### Files touched
- `apps/api/src/modules/auth/*`
- `apps/api/src/lib/rate-limit.ts`
- `apps/api/src/plugins/auth.ts`
- `apps/api/src/lib/tenant-context.ts`

### Test evidence
- Unit: `test/modules/auth.test.ts`
- Manual: Login flow completo con 2FA

### Security checks
- [x] Validación server-side
- [x] Bcrypt 12 rounds
- [x] JWT 1h expiry
- [x] Rate limit 5/min
- [x] 2FA token 10 min TTL

### UX checks
- [x] Mensajes de error claros
- [x] Loading state en botones

## Status
- **Estado:** ✅ DONE
- **Owner:** Auth module
- **Fecha:** Diciembre 2025
