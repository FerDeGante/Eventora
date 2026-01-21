# LAUNCH-02 — Booking Público por Slug

Title: Booking page accesible por slug de clínica (sin clinicId manual)
Priority: A (Crítico para lanzamiento)
Area: Booking / Frontend
Owner Role: Implementer
Estimate: 3 horas

---

## Problem (Evidence)

**Situación actual:**
- Booking wizard está en `/wizard`
- Requiere pasar `clinicId` como query param: `/wizard?clinicId=xxx`
- Usuario final no sabe el `clinicId`
- No es compartible públicamente

**Por qué es crítico:**
- Cliente no puede compartir link a sus clientes
- URL fea y no memorable
- No funciona para marketing (QR codes, Instagram bio, etc.)

**Ejemplo deseado:**
```
❌ https://eventora.com/wizard?clinicId=cm5abc123xyz
✅ https://eventora.com/book/wellness-center
```

---

## Goal

Cliente puede compartir URL limpia tipo:
- `https://eventora.com/book/wellness-center`
- Cliente final reserva sin conocer detalles técnicos
- URL es brandeable y memorable

---

## Scope

**In:**
- Crear ruta `/book/[slug]`
- Lookup de `clinicId` por slug
- Reusar wizard existente con branding de la clinic
- Manejo de slug no encontrado (404)

**Out:**
- Custom domains (wellness-center.com) → Post-MVP
- Widget embebible → Post-MVP
- Analytics de conversión por slug → Post-MVP

---

## Plan

### **Step 1: Crear ruta dinámica**

```typescript
// apps/web/src/app/book/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

type Clinic = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

async function getClinicBySlug(slug: string): Promise<Clinic | null> {
  try {
    return await apiFetch<Clinic>(`/api/v1/public/clinics/by-slug/${slug}`);
  } catch {
    return null;
  }
}

export default async function PublicBookingPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const clinic = await getClinicBySlug(params.slug);
  
  if (!clinic) {
    notFound();
  }
  
  return (
    <div>
      {/* Branding header */}
      <header style={{ 
        background: clinic.primaryColor || '#6366f1',
        padding: '24px',
        textAlign: 'center'
      }}>
        {clinic.logoUrl && (
          <img 
            src={clinic.logoUrl} 
            alt={clinic.name}
            style={{ height: '60px', marginBottom: '12px' }}
          />
        )}
        <h1 style={{ color: 'white', margin: 0 }}>
          {clinic.name}
        </h1>
      </header>
      
      {/* Wizard existente */}
      <WizardContent clinicId={clinic.id} branding={clinic} />
    </div>
  );
}

// Metadata para SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const clinic = await getClinicBySlug(params.slug);
  
  return {
    title: `Reserva en ${clinic?.name || 'Eventora'}`,
    description: `Agenda tu cita en ${clinic?.name}. Reserva online en segundos.`,
  };
}
```

### **Step 2: Extraer wizard a componente reutilizable**

```typescript
// apps/web/src/app/components/booking/WizardContent.tsx

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// ... imports existentes del wizard

type WizardContentProps = {
  clinicId: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
};

export function WizardContent({ clinicId, branding }: WizardContentProps) {
  // Todo el código actual de /wizard
  // Solo inyectar clinicId en queries
  
  const { data: branches } = useQuery({
    queryKey: ['branches', clinicId],
    queryFn: () => apiFetch(`/api/v1/public/branches?clinicId=${clinicId}`)
  });
  
  // ... resto del wizard actual
  
  // Aplicar branding si existe
  const primaryColor = branding?.primaryColor || '#6366f1';
  
  return (
    <div className="wizard-container">
      {/* ... pasos del wizard con colores custom ... */}
    </div>
  );
}
```

### **Step 3: Backend endpoint para lookup por slug**

```typescript
// apps/api/src/modules/catalog/catalog.routes.ts

fastify.get('/public/clinics/by-slug/:slug', async (request, reply) => {
  const { slug } = request.params as { slug: string };
  
  const clinic = await prisma.clinic.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      description: true,
      phone: true,
      email: true,
      address: true,
    }
  });
  
  if (!clinic) {
    return reply.status(404).send({ error: 'Clinic not found' });
  }
  
  return clinic;
});
```

### **Step 4: 404 personalizado**

```typescript
// apps/web/src/app/book/[slug]/not-found.tsx

export default function BookingNotFound() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '80px 20px' 
    }}>
      <h1>Clínica no encontrada</h1>
      <p>
        El link que usaste no es válido o esta clínica ya no está disponible.
      </p>
      <a href="/" style={{ color: '#6366f1' }}>
        Volver al inicio
      </a>
    </div>
  );
}
```

---

## Files to Create

1. **apps/web/src/app/book/[slug]/page.tsx** (nuevo)
   - Server component que hace lookup
   - Renderiza wizard con branding

2. **apps/web/src/app/book/[slug]/not-found.tsx** (nuevo)
   - 404 personalizado

3. **apps/web/src/app/components/booking/WizardContent.tsx** (nuevo)
   - Extraer lógica de `/wizard/page.tsx`
   - Hacer reutilizable

---

## Files to Modify

1. **apps/web/src/app/(app)/wizard/page.tsx**
   - Refactorizar para usar `<WizardContent />`
   - Mantener compatibilidad con versión autenticada

2. **apps/api/src/modules/catalog/catalog.routes.ts**
   - Agregar endpoint `GET /public/clinics/by-slug/:slug`

---

## Acceptance Criteria

1. **Given** URL `https://eventora.com/book/wellness-center`, **When** cliente accede, **Then** ve wizard con branding de Wellness Center
2. **Given** slug inválido, **When** cliente accede, **Then** ve página 404 clara
3. **Given** cliente completa reserva, **When** confirma, **Then** reserva se crea correctamente
4. **Given** link compartido en Instagram/WhatsApp, **When** se abre, **Then** funciona sin friction

---

## Test Evidence Required

**Manual:**
- [ ] Crear clinic con slug "test-gym"
- [ ] Abrir `/book/test-gym` → wizard funciona
- [ ] Completar reserva end-to-end
- [ ] Verificar branding (logo, colores)
- [ ] Probar slug inexistente → 404
- [ ] Compartir link por WhatsApp → funciona en mobile

**Automated:**
```typescript
test('booking by slug works', async () => {
  await page.goto('/book/wellness-center');
  
  // Debe mostrar nombre de la clínica
  await expect(page.locator('h1')).toContainText('Wellness Center');
  
  // Wizard debe funcionar
  await page.click('text=Continuar');
  await expect(page.locator('.wizard-step-2')).toBeVisible();
});

test('invalid slug shows 404', async () => {
  await page.goto('/book/non-existent-clinic');
  await expect(page.locator('h1')).toContainText('no encontrada');
});
```

---

## UX Checks

- [ ] URL es limpia y memorable
- [ ] Branding de la clínica es visible
- [ ] Logo se muestra si existe
- [ ] Colores custom se aplican
- [ ] Mobile responsive
- [ ] Loading states durante lookup
- [ ] 404 es claro y útil

---

## Backend Requirements

**Nuevo endpoint:**
```
GET /api/v1/public/clinics/by-slug/:slug
```

**Response:**
```json
{
  "id": "clinic_123",
  "name": "Wellness Center",
  "slug": "wellness-center",
  "logoUrl": "https://cdn.eventora.com/logos/wellness.png",
  "primaryColor": "#6366f1",
  "secondaryColor": "#8b5cf6",
  "description": "Tu centro de bienestar",
  "phone": "+52 55 1234 5678",
  "email": "info@wellness.com",
  "address": "Av. Reforma 123, CDMX"
}
```

**Edge cases:**
- Slug no existe → 404
- Clinic existe pero está inactiva → 404 o mensaje específico
- Slug con caracteres especiales → normalizar

---

## Technical Notes

**Slugs deben ser:**
- Únicos en DB (ya hay constraint)
- Lowercase
- Solo letras, números, guiones
- Min 3 caracteres
- Max 50 caracteres

**Validación en signup:**
```typescript
// Ya existe en apps/api/src/modules/onboarding/onboarding.schema.ts
slug: z.string()
  .min(3)
  .max(50)
  .regex(/^[a-z0-9-]+$/)
```

**Next.js dynamic routes:**
- `[slug]` folder = dynamic segment
- `params.slug` en component
- Server component puede hacer `await` directo

---

## SEO Optimization (Bonus)

```typescript
// Agregar en page.tsx
export async function generateMetadata({ params }) {
  const clinic = await getClinicBySlug(params.slug);
  
  return {
    title: `Reserva en ${clinic.name} | Eventora`,
    description: clinic.description,
    openGraph: {
      title: clinic.name,
      description: clinic.description,
      images: [clinic.logoUrl],
      url: `https://eventora.com/book/${clinic.slug}`
    }
  };
}
```

---

## Marketing Benefits

✅ URL compartible: `/book/wellness-center`
✅ QR codes imprimibles apuntando a booking
✅ Link en bio de Instagram/Facebook
✅ Email signatures con link directo
✅ Google My Business con booking link
✅ Brandeable (logo + colores)

---

## Status

- Estado: TODO
- Owner: TBD
- Prioridad: CRÍTICA (bloquea marketing)
- Estimado: 3h
- Sprint: Launch Week 1

---

## References

- [FRONTEND_INVENTORY.md](../FRONTEND_INVENTORY.md) - Gap #2
- [SALES_STRATEGY.md](../SALES_STRATEGY.md) - Fase 3: Demo
- apps/web/src/app/(app)/wizard/page.tsx (código a reusar)
