# Sentry Setup Guide - Eventora

## ✅ Configuración Completada

Tu DSN de Sentry ya está configurado en el proyecto:
```
https://26de6472867f590a0477f6aade8a9b65@o4510530702147584.ingest.us.sentry.io/4510530704900096
```

## 🚀 Probar Sentry

### Backend (API)

1. **Iniciar la API:**
```bash
cd apps/api
npm run dev
```

2. **Probar captura de error:**
```bash
# Endpoint de prueba (crear uno temporal)
curl http://localhost:4000/api/v1/test-sentry
```

O añade esto a cualquier ruta:
```typescript
import { captureException } from '../lib/sentry';

try {
  throw new Error('Test error from Eventora API');
} catch (error) {
  captureException(error, { context: 'test' });
}
```

### Frontend (Web)

1. **Iniciar Next.js:**
```bash
cd apps/web
npm run dev
```

2. **Probar en navegador:**
- Abre http://localhost:3000
- Abre la consola del navegador
- Ejecuta:
```javascript
throw new Error('Test error from Eventora Web');
```

## 📊 Ver Errores en Sentry

1. Ve a: https://relatium.sentry.io/
2. Selecciona tu proyecto
3. En unos segundos verás el error aparecer en "Issues"

## 🎯 Ejemplos de Uso

### 1. Capturar Excepciones (Backend)

```typescript
// apps/api/src/modules/users/user.service.ts
import { captureException } from '../../lib/sentry';

async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    captureException(error, { 
      userId: id,
      operation: 'getUserById' 
    });
    throw error;
  }
}
```

### 2. Tracking Performance (Frontend)

```typescript
// apps/web/src/app/(app)/reservas/page.tsx
import * as Sentry from '@sentry/nextjs';

async function handleBooking() {
  return Sentry.startSpan(
    {
      op: 'ui.click',
      name: 'Create Booking',
    },
    async (span) => {
      span.setAttribute('serviceId', serviceId);
      span.setAttribute('branchId', branchId);
      
      const result = await createReservation(data);
      return result;
    }
  );
}
```

### 3. Logging (Frontend)

```typescript
import * as Sentry from '@sentry/nextjs';

const logger = Sentry.getClient()?.logger;

logger?.info('Booking created', { reservationId: '123' });
logger?.warn('Low availability', { slotsLeft: 2 });
logger?.error('Payment failed', { orderId: 'order_123' });
```

### 4. User Context (Ambos)

```typescript
// Backend
import { setUserContext } from './lib/sentry';

setUserContext({
  id: user.id,
  email: user.email,
  clinicId: user.clinicId,
});

// Frontend
import * as Sentry from '@sentry/nextjs';

Sentry.setUser({
  id: session.user.id,
  email: session.user.email,
  clinic_id: session.user.clinicId,
});
```

## 🔍 Features Activas

### Backend
- ✅ Error tracking automático
- ✅ Performance profiling (10% sample)
- ✅ PII redaction (passwords, tokens)
- ✅ User context tracking
- ✅ Custom breadcrumbs

### Frontend
- ✅ Error tracking automático
- ✅ Session Replay (50% en errores, 1% normal)
- ✅ Performance monitoring (10% sample)
- ✅ Console integration
- ✅ PII masking automático

## 📝 Variables de Entorno

Ya están configuradas en:
- `apps/api/.env.sentry`
- `apps/web/.env.sentry`

Para activar en producción, copia a tus `.env` reales:
```bash
# Backend
echo "SENTRY_DSN=https://26de6472867f590a0477f6aade8a9b65@o4510530702147584.ingest.us.sentry.io/4510530704900096" >> apps/api/.env

# Frontend
echo "NEXT_PUBLIC_SENTRY_DSN=https://26de6472867f590a0477f6aade8a9b65@o4510530702147584.ingest.us.sentry.io/4510530704900096" >> apps/web/.env.local
```

## 🎬 Próximos Pasos

1. **Ahora:** Probar con errores de prueba
2. **Antes de deploy:** Verificar que funciona en dev
3. **Post-deploy:** Monitorear dashboard de Sentry
4. **Opcional:** Configurar alertas por Slack/Email

## 📊 Límites del Plan Trial (14 días)

- 5,000 errores/mes gratis después del trial
- Session replays ilimitados en trial
- Performance monitoring incluido

---

¿Quieres probar ahora mismo generando un error de prueba?
