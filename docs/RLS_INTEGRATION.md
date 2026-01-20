# RLS Integration Guide - Backend API

## 📋 Overview

Esta guía explica cómo integrar las políticas Row Level Security (RLS) con el backend API de Bloom (`apps/api`).

**Migración aplicada:** `20251213000000_enable_rls_policies`  
**Requisito:** PostgreSQL con RLS habilitado (Neon compatible)

---

## 🎯 Objetivo

RLS garantiza **aislamiento de datos a nivel de base de datos** entre tenants (clinics). Incluso si un bug en el código API olvida filtrar por `clinicId`, PostgreSQL bloqueará el acceso.

**Ejemplo sin RLS:**
```typescript
// Bug: Olvida filtrar por clinicId
const users = await prisma.user.findMany();
// Resultado: Devuelve usuarios de TODAS las clinics ❌
```

**Ejemplo con RLS:**
```typescript
// Mismo bug, pero RLS protege
await setTenantContext(clinicId); // Set en middleware
const users = await prisma.user.findMany();
// Resultado: Solo devuelve usuarios de la clinic actual ✅
```

---

## 🔧 Implementación Requerida

### 1. Middleware de Tenant Context

**Archivo:** `apps/api/src/plugins/tenant.ts` (modificar existente)

```typescript
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

/**
 * Plugin para establecer el contexto de tenant en cada request
 */
const tenantPlugin: FastifyPluginAsync = async (fastify) => {
  
  // Hook que se ejecuta ANTES de cada request
  fastify.addHook('onRequest', async (request, reply) => {
    // Obtener clinicId desde:
    // 1. JWT del usuario autenticado
    // 2. Header custom (para webhooks)
    // 3. Subdomain (si multi-subdomain)
    
    const clinicId = 
      request.user?.clinicId ||           // Desde JWT
      request.headers['x-clinic-id'] ||   // Desde header
      extractClinicFromSubdomain(request.hostname); // Desde subdomain
    
    if (!clinicId) {
      // Request sin tenant (endpoints públicos OK, autenticados FAIL)
      if (request.routeOptions.config?.requiresTenant !== false) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Tenant context required',
        });
      }
      return; // Skip RLS para endpoints públicos
    }
    
    // Validar que clinicId es válido (prevenir SQL injection)
    if (!isValidCuid(clinicId)) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Invalid tenant ID format',
      });
    }
    
    // Establecer contexto de tenant en Prisma
    await fastify.prisma.$executeRawUnsafe(
      `SET LOCAL app.current_tenant = '${clinicId}'`
    );
    
    // Guardar en request para uso posterior
    request.tenant = { clinicId };
    
    fastify.log.debug({ clinicId }, 'Tenant context set');
  });
  
  // Hook que se ejecuta DESPUÉS de cada request (cleanup)
  fastify.addHook('onResponse', async (request, reply) => {
    // PostgreSQL automáticamente resetea app.current_tenant al final de la transacción
    // Este hook es opcional, pero útil para logging
    fastify.log.debug('Request completed, tenant context will be reset');
  });
};

export default fp(tenantPlugin, {
  name: 'tenant-plugin',
  dependencies: ['prisma'], // Requiere que prisma plugin ya esté cargado
});

// Helper: Validar CUID format
function isValidCuid(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}

// Helper: Extraer clinic desde subdomain
function extractClinicFromSubdomain(hostname: string): string | null {
  // Ejemplo: spa-relax.bloom.com -> buscar clinic con slug 'spa-relax'
  const subdomain = hostname.split('.')[0];
  
  if (['www', 'api', 'admin'].includes(subdomain)) {
    return null; // Subdomains reservados
  }
  
  // Aquí iría lógica para buscar clinic por slug
  // Por ahora retornar null, implementar según necesidad
  return null;
}
```

---

### 2. Actualizar Fastify Types

**Archivo:** `apps/api/src/types/fastify.d.ts` (modificar existente)

```typescript
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      clinicId: string;
      role: string;
      email: string;
    };
    tenant?: {
      clinicId: string;
    };
  }
  
  interface FastifyContextConfig {
    requiresTenant?: boolean; // Default: true
  }
}
```

---

### 3. Marcar Rutas Públicas (Opcional)

Para rutas que NO requieren tenant context (ej: login, registro):

```typescript
// apps/api/src/modules/auth/routes.ts

fastify.post('/login', {
  config: {
    requiresTenant: false, // Skip tenant validation
  },
  schema: loginSchema,
  handler: async (request, reply) => {
    // Login logic
  },
});

fastify.post('/register', {
  config: {
    requiresTenant: false,
  },
  handler: async (request, reply) => {
    // Register logic
  },
});
```

---

### 4. Manejo de Transacciones

**IMPORTANTE:** En transacciones Prisma, el `app.current_tenant` debe establecerse dentro de cada transacción:

```typescript
// ❌ INCORRECTO: Set fuera de transacción
await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinicId}'`);

await prisma.$transaction(async (tx) => {
  const users = await tx.user.findMany(); // RLS NO aplicado aquí
});

// ✅ CORRECTO: Set dentro de transacción
await prisma.$transaction(async (tx) => {
  await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinicId}'`);
  
  const users = await tx.user.findMany(); // RLS aplicado ✅
  const reservations = await tx.reservation.findMany(); // RLS aplicado ✅
});
```

**Mejor práctica:** Crear helper para transacciones con tenant:

```typescript
// apps/api/src/lib/tenant-transaction.ts

import { PrismaClient } from '@prisma/client';

export async function tenantTransaction<T>(
  prisma: PrismaClient,
  clinicId: string,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Set tenant context en la transacción
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinicId}'`);
    
    // Ejecutar callback
    return fn(tx);
  });
}

// Uso:
await tenantTransaction(prisma, request.tenant.clinicId, async (tx) => {
  const user = await tx.user.create({ data: userData });
  const reservation = await tx.reservation.create({ data: reservationData });
  return { user, reservation };
});
```

---

### 5. Testing de RLS en Tests Unitarios

**Archivo:** `apps/api/src/test/setup.ts`

```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Helper para tests con tenant context
export async function withTenant<T>(
  clinicId: string,
  fn: () => Promise<T>
): Promise<T> {
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinicId}'`);
  
  try {
    return await fn();
  } finally {
    await prisma.$executeRawUnsafe(`RESET app.current_tenant`);
  }
}

// Ejemplo de test:
describe('User API', () => {
  it('should only return users from current tenant', async () => {
    const clinic1 = await prisma.clinic.create({ data: { name: 'Clinic 1', slug: 'c1' } });
    const clinic2 = await prisma.clinic.create({ data: { name: 'Clinic 2', slug: 'c2' } });
    
    // Crear usuarios en clinic1
    await withTenant(clinic1.id, async () => {
      await prisma.user.create({
        data: {
          clinicId: clinic1.id,
          email: 'user1@clinic1.com',
          passwordHash: 'hash',
          role: 'CLIENT',
        },
      });
    });
    
    // Crear usuarios en clinic2
    await withTenant(clinic2.id, async () => {
      await prisma.user.create({
        data: {
          clinicId: clinic2.id,
          email: 'user1@clinic2.com',
          passwordHash: 'hash',
          role: 'CLIENT',
        },
      });
    });
    
    // Verificar aislamiento
    await withTenant(clinic1.id, async () => {
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('user1@clinic1.com');
    });
    
    await withTenant(clinic2.id, async () => {
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('user1@clinic2.com');
    });
  });
});
```

---

## 🚨 Casos Especiales

### Caso 1: Webhooks de Stripe/MercadoPago

Los webhooks NO tienen usuario autenticado. Opciones:

**Opción A: Extraer clinicId del payload**
```typescript
fastify.post('/webhooks/stripe', {
  config: { requiresTenant: false },
  handler: async (request, reply) => {
    const event = request.body;
    
    // Extraer clinicId del metadata
    const clinicId = event.data.object.metadata.clinicId;
    
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinicId}'`);
    
    // Procesar webhook...
  },
});
```

**Opción B: Usar stripeAccountId para lookup**
```typescript
fastify.post('/webhooks/stripe', async (request, reply) => {
  const event = request.body;
  const stripeAccountId = event.account; // Stripe Connect account
  
  // Buscar clinic sin RLS (bypassRLS)
  const clinic = await prisma.clinic.findFirst({
    where: { stripeAccountId },
  });
  
  if (!clinic) {
    return reply.code(404).send({ error: 'Clinic not found' });
  }
  
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinic.id}'`);
  
  // Ahora procesar webhook con RLS activo
});
```

---

### Caso 2: Admin/Super Admin Cross-Tenant

Para usuarios que necesitan acceso a múltiples clinics (ej: soporte técnico):

```typescript
// Opción A: Bypass RLS temporalmente (PELIGROSO, usar con cuidado)
await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant TO DEFAULT`);

// Opción B: Cambiar tenant dinámicamente
async function switchTenant(newClinicId: string) {
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${newClinicId}'`);
}

// Admin endpoint para ver datos de cualquier clinic
fastify.get('/admin/clinics/:clinicId/users', {
  preHandler: requireSuperAdmin, // Middleware de autorización
  handler: async (request, reply) => {
    const targetClinicId = request.params.clinicId;
    
    // Super admin puede cambiar tenant
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${targetClinicId}'`);
    
    const users = await prisma.user.findMany();
    return users;
  },
});
```

---

### Caso 3: Reporting Cross-Tenant (Dashboard Global)

Si necesitas reportes agregados de todas las clinics:

```typescript
// Usar una conexión separada SIN RLS para reportes
import { PrismaClient } from '@prisma/client';

const adminPrisma = new PrismaClient({
  // Usar DATABASE_URL directo (puerto 5432), no pooler
  datasources: {
    db: {
      url: process.env.DATABASE_ADMIN_URL,
    },
  },
});

// En el handler:
fastify.get('/admin/reports/global', {
  preHandler: requireSuperAdmin,
  handler: async (request, reply) => {
    // adminPrisma NO tiene RLS, ve todo
    const stats = await adminPrisma.$queryRaw`
      SELECT 
        c.name AS clinic_name,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT r.id) AS total_reservations
      FROM "Clinic" c
      LEFT JOIN "User" u ON u."clinicId" = c.id
      LEFT JOIN "Reservation" r ON r."clinicId" = c.id
      GROUP BY c.id
    `;
    
    return stats;
  },
});
```

---

## 📊 Validación de Integración

### Checklist de Implementación

- [ ] Tenant plugin creado en `apps/api/src/plugins/tenant.ts`
- [ ] Plugin registrado en `apps/api/src/main.ts`
- [ ] Types actualizados en `fastify.d.ts`
- [ ] Rutas públicas marcadas con `requiresTenant: false`
- [ ] Helper `tenantTransaction()` creado
- [ ] Tests unitarios con `withTenant()` helper
- [ ] Webhooks manejan tenant context correctamente
- [ ] Logging de tenant context en requests

### Testing Manual

```bash
# 1. Aplicar migración RLS
npx prisma migrate deploy

# 2. Ejecutar test suite automatizado
node scripts/test-rls.js

# 3. Test manual con Prisma Studio
npx prisma studio
# En console:
# SET app.current_tenant = 'cmi98dsko00004kibtxajvfi9';
# SELECT * FROM "User";
# Debería solo mostrar users de esa clinic

# 4. Test API con curl
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <JWT_TOKEN>"
# Debería solo devolver users de la clinic del JWT
```

---

## 🔍 Troubleshooting

### Problema: "No rows returned" en queries válidos

**Causa:** `app.current_tenant` no está set o tiene valor incorrecto.

**Solución:**
```typescript
// Agregar logging en middleware
fastify.log.info({ 
  clinicId: request.tenant?.clinicId,
  user: request.user?.id 
}, 'Tenant context');

// Verificar en DB
await prisma.$queryRaw`SELECT current_setting('app.current_tenant', true) AS tenant`;
```

---

### Problema: RLS no aplica en transacciones

**Causa:** `SET LOCAL` debe estar DENTRO de `$transaction()`.

**Solución:** Usar helper `tenantTransaction()` mostrado arriba.

---

### Problema: Performance degradado

**Causa:** Falta índice en `clinicId` de alguna tabla.

**Solución:**
```sql
-- Ver queries lentos
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%clinicId%' 
ORDER BY mean_exec_time DESC;

-- Agregar índice faltante
CREATE INDEX CONCURRENTLY idx_table_clinicId ON "Table"("clinicId");
```

---

## 🎓 Referencias

- **Migración SQL:** `prisma/migrations/20251213000000_enable_rls_policies/migration.sql`
- **Test Suite:** `scripts/test-rls.js`
- **PostgreSQL RLS Docs:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Neon RLS Support:** https://neon.tech/docs/guides/row-level-security

---

## ✅ Next Steps

1. Implementar `tenant.ts` plugin según esta guía
2. Agregar tests unitarios con `withTenant()` helper
3. Ejecutar `node scripts/test-rls.js` para validar RLS
4. Deploy a staging y monitorear logs
5. Coordinar con Codex para review de código

---

**Última actualización:** 13 de diciembre de 2025  
**Owner:** Infrastructure Team  
**Reviewers:** Backend Team, Codex
