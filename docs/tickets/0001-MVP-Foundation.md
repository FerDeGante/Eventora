# T-0001 — MVP Foundation

## Contexto
- **Problema:** Necesitamos la base técnica para construir el producto
- **Por qué importa:** Sin esto, no hay producto
- **Usuarios afectados:** Todos

## Alcance
### Incluye
- Monorepo setup (apps/api + apps/web)
- Prisma + PostgreSQL (Supabase)
- Variables de entorno
- Docker compose
- Scripts de desarrollo
- Logging + error handling

### No incluye
- Features de negocio
- UI de usuario

## Criterios de aceptación
1. ✅ `npm run dev` levanta API y Web
2. ✅ Prisma conecta a Supabase
3. ✅ Sentry captura errores
4. ✅ Rate limiting funciona

## Plan
- [x] Setup monorepo
- [x] Configurar Prisma
- [x] Configurar Fastify
- [x] Configurar Next.js
- [x] Docker compose
- [x] Scripts db-reset, db-backup

## Implementación

### Files touched
- `package.json` (root)
- `apps/api/*`
- `apps/web/*`
- `prisma/schema.prisma`
- `docker-compose.yml`
- `scripts/*`

### Test evidence
- Manual: API responde en localhost:4000
- Manual: Web responde en localhost:3000
- Unit: N/A para foundation

### Security checks
- [x] Variables en .env, no en código
- [x] .gitignore incluye .env
- [x] Secrets no loggeados

### UX checks
- N/A (infraestructura)

## Status
- **Estado:** ✅ DONE
- **Owner:** Setup inicial
- **Fecha:** Diciembre 2025
