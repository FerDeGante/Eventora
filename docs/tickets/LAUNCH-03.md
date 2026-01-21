# LAUNCH-03 — Setup Wizard Post-Signup

Title: Wizard de configuración inicial después de crear workspace
Priority: A (Crítico para lanzamiento)
Area: Onboarding / Frontend
Owner Role: Implementer
Estimate: 6 horas

---

## Problem (Evidence)

**Situación actual:**
- Cliente completa signup y pago en Stripe
- Llega a `/onboarding/success`
- Es redirigido a dashboard vacío
- No sabe qué hacer primero
- No hay guía de setup inicial

**Por qué es crítico:**
- Cliente confundido → churn inmediato
- Time-to-value muy largo
- Requiere onboarding manual (no escala)
- UX pobre vs competencia

**Flujo actual:**
```
Signup → Stripe Checkout → Success → Dashboard vacío ❌
```

**Flujo deseado:**
```
Signup → Stripe Checkout → Success → Setup Wizard → Dashboard funcional ✅
```

---

## Goal

Cliente que acaba de pagar tiene un wizard de 4 pasos que lo guía a:
1. Crear sus primeros servicios
2. Configurar horarios de operación
3. (Opcional) Invitar staff
4. Conectar Stripe Connect para recibir pagos

Al final del wizard, el sistema está listo para recibir reservas.

---

## Scope

**In:**
- Wizard de 4 pasos progresivo
- Validación mínima (al menos 1 servicio, 1 horario)
- Skip opcional para pasos no críticos
- Persistencia de progreso (si abandona y regresa)
- Redirect a dashboard al completar

**Out:**
- Importación de datos desde otros sistemas
- Configuración avanzada (recursos, integraciones)
- Customización de branding (post-wizard)
- Configuración de membresías/paquetes

---

## Plan

### **Step 1: Detectar setup incompleto**

Agregar a schema:
```prisma
model Clinic {
  // ... campos existentes
  setupCompleted  Boolean @default(false)
  setupStep       Int     @default(1) // 1-4
  // ...
}
```

Middleware en dashboard:
```typescript
// apps/web/src/app/(app)/layout.tsx

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  
  useEffect(() => {
    apiFetch<Clinic>('/api/v1/clinics/current').then(setClinic);
  }, []);
  
  // Redirect a setup si no está completo
  useEffect(() => {
    if (clinic && !clinic.setupCompleted && !pathname.includes('/setup')) {
      router.push('/setup');
    }
  }, [clinic]);
  
  return <>{children}</>;
}
```

---

### **Step 2: Crear wizard de setup**

```typescript
// apps/web/src/app/(app)/setup/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

type SetupStep = 1 | 2 | 3 | 4;

export default function SetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  
  // Load clinic to resume from last step
  useEffect(() => {
    apiFetch<Clinic>('/api/v1/clinics/current').then(data => {
      setClinic(data);
      setCurrentStep(data.setupStep as SetupStep);
    });
  }, []);
  
  const handleStepComplete = async (step: SetupStep) => {
    // Save progress
    await apiFetch('/api/v1/clinics/current', {
      method: 'PATCH',
      json: { setupStep: step + 1 }
    });
    
    if (step === 4) {
      // Mark setup as complete
      await apiFetch('/api/v1/clinics/current', {
        method: 'PATCH',
        json: { setupCompleted: true }
      });
      router.push('/dashboard');
    } else {
      setCurrentStep((step + 1) as SetupStep);
    }
  };
  
  const handleSkip = () => {
    handleStepComplete(currentStep);
  };
  
  return (
    <div className="setup-wizard">
      <header>
        <h1>Configura tu espacio</h1>
        <progress value={currentStep} max={4} />
        <p>Paso {currentStep} de 4</p>
      </header>
      
      {currentStep === 1 && (
        <Step1Services 
          onComplete={() => handleStepComplete(1)} 
          onSkip={handleSkip}
        />
      )}
      
      {currentStep === 2 && (
        <Step2Schedule 
          onComplete={() => handleStepComplete(2)}
          onSkip={handleSkip}
        />
      )}
      
      {currentStep === 3 && (
        <Step3Team 
          onComplete={() => handleStepComplete(3)}
          onSkip={handleSkip}
        />
      )}
      
      {currentStep === 4 && (
        <Step4Payments 
          onComplete={() => handleStepComplete(4)}
        />
      )}
    </div>
  );
}
```

---

### **Step 3: Implementar pasos individuales**

#### **Paso 1: Servicios**

```typescript
// apps/web/src/app/(app)/setup/Step1Services.tsx

type Step1Props = {
  onComplete: () => void;
  onSkip: () => void;
};

export function Step1Services({ onComplete, onSkip }: Step1Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(0);
  
  const handleAddService = async () => {
    const newService = await apiFetch<Service>('/api/v1/services', {
      method: 'POST',
      json: {
        name,
        duration,
        price: price * 100, // Convert to cents
        category: 'SESSION'
      }
    });
    
    setServices([...services, newService]);
    setName('');
    setDuration(60);
    setPrice(0);
  };
  
  const canContinue = services.length > 0;
  
  return (
    <div className="setup-step">
      <h2>¿Qué servicios ofreces?</h2>
      <p>Agrega al menos un servicio para que los clientes puedan reservar.</p>
      
      <div className="service-form">
        <input 
          placeholder="Nombre del servicio (ej: Yoga 60 min)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="number"
          placeholder="Duración (minutos)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
        <input 
          type="number"
          placeholder="Precio (MXN)"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <button onClick={handleAddService}>Agregar</button>
      </div>
      
      <div className="services-list">
        <h3>Servicios agregados ({services.length})</h3>
        {services.map(s => (
          <div key={s.id} className="service-item">
            <strong>{s.name}</strong>
            <span>{s.duration} min</span>
            <span>${s.price / 100}</span>
          </div>
        ))}
      </div>
      
      <div className="step-actions">
        <button onClick={onSkip} variant="ghost">
          Agregar después
        </button>
        <button 
          onClick={onComplete} 
          disabled={!canContinue}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
```

#### **Paso 2: Horarios**

```typescript
// apps/web/src/app/(app)/setup/Step2Schedule.tsx

export function Step2Schedule({ onComplete, onSkip }: StepProps) {
  const [schedule, setSchedule] = useState({
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '18:00' },
    saturday: { enabled: false, start: '10:00', end: '14:00' },
    sunday: { enabled: false, start: '10:00', end: '14:00' },
  });
  
  const handleSave = async () => {
    await apiFetch('/api/v1/availability/templates', {
      method: 'POST',
      json: {
        name: 'Horario principal',
        schedule
      }
    });
    onComplete();
  };
  
  return (
    <div className="setup-step">
      <h2>¿Cuándo están abiertos?</h2>
      <p>Configura tu horario de atención para que los clientes sepan cuándo pueden reservar.</p>
      
      {Object.entries(schedule).map(([day, config]) => (
        <div key={day} className="day-schedule">
          <label>
            <input 
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setSchedule({
                ...schedule,
                [day]: { ...config, enabled: e.target.checked }
              })}
            />
            <span>{day}</span>
          </label>
          
          {config.enabled && (
            <>
              <input 
                type="time"
                value={config.start}
                onChange={(e) => setSchedule({
                  ...schedule,
                  [day]: { ...config, start: e.target.value }
                })}
              />
              <span>a</span>
              <input 
                type="time"
                value={config.end}
                onChange={(e) => setSchedule({
                  ...schedule,
                  [day]: { ...config, end: e.target.value }
                })}
              />
            </>
          )}
        </div>
      ))}
      
      <div className="step-actions">
        <button onClick={onSkip} variant="ghost">
          Configurar después
        </button>
        <button onClick={handleSave}>
          Continuar
        </button>
      </div>
    </div>
  );
}
```

#### **Paso 3: Team (Opcional)**

```typescript
// apps/web/src/app/(app)/setup/Step3Team.tsx

export function Step3Team({ onComplete, onSkip }: StepProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'RECEPTION' | 'THERAPIST'>('RECEPTION');
  const [invites, setInvites] = useState<string[]>([]);
  
  const handleInvite = () => {
    setInvites([...invites, email]);
    setEmail('');
    // En producción: enviar email de invitación
  };
  
  return (
    <div className="setup-step">
      <h2>¿Quieres invitar a tu equipo?</h2>
      <p>Agrega a tu personal para que puedan hacer check-ins, ver el calendario y más.</p>
      
      <div className="invite-form">
        <input 
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="RECEPTION">Recepción</option>
          <option value="THERAPIST">Terapeuta</option>
        </select>
        <button onClick={handleInvite}>Invitar</button>
      </div>
      
      {invites.length > 0 && (
        <div className="invites-list">
          <h3>Invitaciones enviadas</h3>
          {invites.map(email => (
            <div key={email}>{email}</div>
          ))}
        </div>
      )}
      
      <div className="step-actions">
        <button onClick={onSkip} variant="ghost">
          Agregar después
        </button>
        <button onClick={onComplete}>
          Continuar
        </button>
      </div>
    </div>
  );
}
```

#### **Paso 4: Stripe Connect**

```typescript
// apps/web/src/app/(app)/setup/Step4Payments.tsx

export function Step4Payments({ onComplete }: { onComplete: () => void }) {
  const [status, setStatus] = useState<'pending' | 'connecting' | 'connected'>('pending');
  const [accountStatus, setAccountStatus] = useState<any>(null);
  
  useEffect(() => {
    // Check if already connected
    apiFetch('/api/v1/stripe/connect/status')
      .then(data => {
        if (data.chargesEnabled) {
          setStatus('connected');
          setAccountStatus(data);
        }
      });
  }, []);
  
  const handleConnect = async () => {
    setStatus('connecting');
    const { url } = await apiFetch<{ url: string }>('/api/v1/stripe/connect/onboarding', {
      method: 'POST',
      json: {
        returnUrl: `${window.location.origin}/setup?step=4`,
        refreshUrl: `${window.location.origin}/setup?step=4`
      }
    });
    
    // Redirect to Stripe
    window.location.href = url;
  };
  
  return (
    <div className="setup-step">
      <h2>Conecta tu cuenta de pagos</h2>
      <p>Para recibir pagos con tarjeta, necesitas conectar tu cuenta de Stripe.</p>
      
      {status === 'pending' && (
        <>
          <div className="info-box">
            <h3>¿Por qué Stripe?</h3>
            <ul>
              <li>✅ Pagos seguros con tarjeta</li>
              <li>✅ Depósitos directos a tu cuenta</li>
              <li>✅ Sin costos ocultos</li>
              <li>✅ Compliance automático</li>
            </ul>
            <p>Stripe cobra 2.9% + $3 MXN por transacción.</p>
          </div>
          
          <button onClick={handleConnect} size="large">
            Conectar con Stripe
          </button>
          
          <button onClick={onComplete} variant="ghost">
            Configurar después
          </button>
        </>
      )}
      
      {status === 'connecting' && (
        <div className="loading-state">
          <p>Redirigiendo a Stripe...</p>
        </div>
      )}
      
      {status === 'connected' && (
        <>
          <div className="success-box">
            <h3>¡Cuenta conectada! ✅</h3>
            <p>Ya puedes recibir pagos con tarjeta.</p>
          </div>
          
          <button onClick={onComplete} size="large">
            Ir al Dashboard
          </button>
        </>
      )}
    </div>
  );
}
```

---

## Files to Create

1. **apps/web/src/app/(app)/setup/page.tsx** - Main wizard
2. **apps/web/src/app/(app)/setup/Step1Services.tsx**
3. **apps/web/src/app/(app)/setup/Step2Schedule.tsx**
4. **apps/web/src/app/(app)/setup/Step3Team.tsx**
5. **apps/web/src/app/(app)/setup/Step4Payments.tsx**

---

## Files to Modify

1. **prisma/schema.prisma**
   ```prisma
   model Clinic {
     // ... existing fields
     setupCompleted  Boolean @default(false)
     setupStep       Int     @default(1)
   }
   ```

2. **apps/web/src/app/(app)/layout.tsx**
   - Detectar setup incompleto
   - Redirect a `/setup` si necesario

3. **apps/web/src/app/onboarding/success/page.tsx**
   - Redirect a `/setup` en vez de `/dashboard`

---

## Acceptance Criteria

1. **Given** nuevo cliente completa signup, **When** llega a success, **Then** ve wizard de setup
2. **Given** cliente en paso 2, **When** cierra browser, **Then** al volver continúa desde paso 2
3. **Given** cliente completa 4 pasos, **When** finaliza, **Then** dashboard está funcional con servicios y horarios
4. **Given** cliente hace skip en paso 3, **When** continúa, **Then** puede agregar team después
5. **Given** cliente completa setup, **When** intenta volver a `/setup`, **Then** redirect a dashboard

---

## Test Evidence Required

**Manual:**
- [ ] Signup nuevo cliente → ve wizard
- [ ] Agregar 3 servicios → paso 1 completo
- [ ] Configurar horario Lun-Vie → paso 2 completo
- [ ] Skip team → paso 3 saltado
- [ ] Conectar Stripe → paso 4 completo
- [ ] Ver dashboard funcional
- [ ] Cerrar browser en paso 2 → regresa al paso 2
- [ ] Intentar acceder `/setup` con setup completo → redirect

**Automated:**
```typescript
test('setup wizard flow', async () => {
  // ... signup steps ...
  
  await page.waitForURL('/setup');
  
  // Step 1: Services
  await page.fill('[name="serviceName"]', 'Yoga 60 min');
  await page.fill('[name="duration"]', '60');
  await page.fill('[name="price"]', '350');
  await page.click('text=Agregar');
  await page.click('text=Continuar');
  
  // Step 2: Schedule
  await page.click('text=Continuar');
  
  // Step 3: Team
  await page.click('text=Agregar después');
  
  // Step 4: Payments
  await page.click('text=Configurar después');
  
  // Should be at dashboard
  await page.waitForURL('/dashboard');
});
```

---

## UX Checks

- [ ] Progress bar clara (Paso X de 4)
- [ ] Botón "Skip" disponible en pasos opcionales
- [ ] Validación de campos con mensajes útiles
- [ ] Loading states en saves
- [ ] Success messages al completar pasos
- [ ] Mobile responsive
- [ ] Botón "Volver" funciona (no pierde progreso)

---

## Backend Requirements

**Nuevos endpoints:**
```
PATCH /api/v1/clinics/:id
{
  "setupCompleted": true,
  "setupStep": 4
}
```

Ya existen:
- ✅ POST /api/v1/services
- ✅ POST /api/v1/availability/templates
- ✅ POST /api/v1/users (invitar team)
- ✅ POST /api/v1/stripe/connect/onboarding

---

## Migration

```sql
-- Add setup tracking fields
ALTER TABLE "Clinic" 
ADD COLUMN "setupCompleted" BOOLEAN DEFAULT false,
ADD COLUMN "setupStep" INTEGER DEFAULT 1;
```

---

## Status

- Estado: TODO
- Owner: TBD
- Prioridad: CRÍTICA (bloquea self-service)
- Estimado: 6h
- Sprint: Launch Week 1

---

## References

- [FRONTEND_INVENTORY.md](../FRONTEND_INVENTORY.md) - Gap #3
- [SALES_STRATEGY.md](../SALES_STRATEGY.md) - Fase 4: Onboarding
- apps/web/src/app/(auth)/signup/page.tsx (signup existente)
