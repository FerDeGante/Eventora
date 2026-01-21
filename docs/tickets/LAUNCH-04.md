# LAUNCH-04 — Stripe Connect Completion

Title: UX completa para Stripe Connect onboarding y status
Priority: A (Crítico para recibir pagos)
Area: Payments / Frontend
Owner Role: Implementer
Estimate: 4 horas

---

## Problem (Evidence)

**Situación actual:**
- Existe página `/settings/payments`
- Tiene botón "Conectar Stripe" básico
- No hay feedback de progreso
- No muestra estado después de conectar
- No maneja casos de onboarding incompleto
- Cliente no sabe si ya puede recibir pagos

**Por qué es crítico:**
- **Sin esto, clínica NO puede recibir pagos con tarjeta**
- Es el bloqueante #1 para go-live
- UX confusa genera tickets de soporte
- Onboarding incompleto = dinero perdido

**Referencia:**
- Ticket FRONT-B3 está pendiente
- docs/tickets/FRONT-B3.md tiene el plan

---

## Goal

Clínica puede conectar su cuenta de Stripe fácilmente y saber exactamente:
- ✅ Si puede recibir pagos
- ✅ Si puede recibir depósitos (payouts)
- ✅ Próximos pasos si onboarding está incompleto
- ✅ Balance disponible

---

## Scope

**In:**
- Flow completo de Stripe Connect onboarding
- Status checks en tiempo real
- Manejo de todos los estados:
  - No conectado
  - Onboarding en progreso
  - Charges habilitados
  - Payouts habilitados
  - Onboarding rechazado
- Retry logic para onboarding fallido
- Balance display

**Out:**
- Configuración avanzada de Stripe (webhooks custom, etc.)
- Dashboard de transacciones (existe en `/reports`)
- Gestión de refunds (ya existe en API)

---

## Plan

### **Architecture Overview**

```
┌──────────────────────────────────────────────────┐
│          /settings/payments                      │
│                                                  │
│  1. Fetch current status                        │
│  2. Show appropriate UI:                        │
│     - Not connected → Connect button            │
│     - In progress → Continue button + info      │
│     - Connected → Status cards + balance        │
│  3. Poll status after return from Stripe        │
└──────────────────────────────────────────────────┘
```

### **Step 1: Mejorar status API**

```typescript
// apps/api/src/modules/connect/connect.routes.ts

fastify.get('/status', async (request, reply) => {
  const { clinicId } = request.user;
  
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      stripeChargesEnabled: true,
      stripePayoutsEnabled: true,
    }
  });
  
  if (!clinic?.stripeAccountId) {
    return {
      connected: false,
      status: 'not_connected',
      message: 'No has conectado tu cuenta de Stripe aún'
    };
  }
  
  // Fetch live status from Stripe
  const account = await stripe.accounts.retrieve(clinic.stripeAccountId);
  
  // Get balance
  const balance = await stripe.balance.retrieve({
    stripeAccount: clinic.stripeAccountId
  });
  
  return {
    connected: true,
    accountId: clinic.stripeAccountId,
    status: account.details_submitted ? 'active' : 'incomplete',
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: {
      currently_due: account.requirements?.currently_due || [],
      eventually_due: account.requirements?.eventually_due || [],
      pending_verification: account.requirements?.pending_verification || []
    },
    balance: {
      available: balance.available,
      pending: balance.pending,
      currency: balance.available[0]?.currency || 'mxn'
    },
    capabilities: account.capabilities,
    email: account.email,
    country: account.country,
    business_type: account.business_type
  };
});
```

### **Step 2: UI States - Not Connected**

```typescript
// apps/web/src/app/(app)/settings/payments/page.tsx

export default function PaymentsSettingsPage() {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  
  useEffect(() => {
    loadStatus();
  }, []);
  
  const loadStatus = async () => {
    setLoading(true);
    const data = await apiFetch<StripeStatus>('/api/v1/stripe/connect/status');
    setStatus(data);
    setLoading(false);
  };
  
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await apiFetch<{ url: string }>('/api/v1/stripe/connect/onboarding', {
        method: 'POST',
        json: {
          returnUrl: `${window.location.origin}/settings/payments?connected=true`,
          refreshUrl: `${window.location.origin}/settings/payments`
        }
      });
      
      window.location.href = url;
    } catch (error) {
      setConnecting(false);
      alert('Error al conectar con Stripe');
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  if (!status?.connected) {
    return (
      <div className="payments-settings">
        <SectionHeading title="Configuración de Pagos" />
        
        <GlowCard>
          <div className="not-connected">
            <h2>Conecta tu cuenta de Stripe</h2>
            <p>
              Para recibir pagos con tarjeta de tus clientes, necesitas 
              conectar una cuenta de Stripe.
            </p>
            
            <div className="benefits">
              <h3>¿Por qué Stripe?</h3>
              <ul>
                <li>✅ Pagos seguros certificados PCI</li>
                <li>✅ Depósitos directos a tu banco en 2-3 días</li>
                <li>✅ Acepta todas las tarjetas (Visa, MC, Amex)</li>
                <li>✅ Sin costos de setup ni mensualidades</li>
                <li>✅ Dashboard completo de transacciones</li>
              </ul>
            </div>
            
            <div className="pricing">
              <h3>Tarifas de Stripe</h3>
              <p>2.9% + $3 MXN por transacción exitosa</p>
              <small>Sin cargos por intentos fallidos</small>
            </div>
            
            <EventoraButton 
              onClick={handleConnect}
              disabled={connecting}
              size="large"
            >
              {connecting ? 'Redirigiendo a Stripe...' : 'Conectar con Stripe'}
            </EventoraButton>
            
            <div className="help-text">
              <p>
                El proceso toma 5-10 minutos. Necesitarás:
              </p>
              <ul>
                <li>RFC</li>
                <li>CLABE bancaria</li>
                <li>Identificación oficial</li>
              </ul>
            </div>
          </div>
        </GlowCard>
      </div>
    );
  }
  
  // ... continued in next step
}
```

### **Step 3: UI States - Incomplete Onboarding**

```typescript
// Continuation of PaymentsSettingsPage

if (status.connected && !status.detailsSubmitted) {
  return (
    <div className="payments-settings">
      <SectionHeading title="Configuración de Pagos" />
      
      <GlowCard className="warning">
        <h2>⚠️ Onboarding incompleto</h2>
        <p>
          Tu cuenta de Stripe está conectada pero necesita más información 
          para poder recibir pagos.
        </p>
        
        {status.requirements.currently_due.length > 0 && (
          <div className="requirements">
            <h3>Información requerida:</h3>
            <ul>
              {status.requirements.currently_due.map(req => (
                <li key={req}>{formatRequirement(req)}</li>
              ))}
            </ul>
          </div>
        )}
        
        <EventoraButton 
          onClick={handleConnect}
          size="large"
        >
          Continuar configuración en Stripe
        </EventoraButton>
      </GlowCard>
    </div>
  );
}
```

### **Step 4: UI States - Fully Connected**

```typescript
// Continuation - fully connected state

return (
  <div className="payments-settings">
    <SectionHeading 
      title="Configuración de Pagos"
      eyebrow="Stripe Connect"
    />
    
    <div className="status-cards">
      <GlowCard className={status.chargesEnabled ? 'success' : 'warning'}>
        <div className="status-header">
          <h3>Cobros con tarjeta</h3>
          {status.chargesEnabled ? (
            <span className="badge success">✅ Habilitado</span>
          ) : (
            <span className="badge warning">⏳ Pendiente</span>
          )}
        </div>
        <p>
          {status.chargesEnabled 
            ? 'Ya puedes cobrar con tarjeta a tus clientes'
            : 'Stripe está revisando tu información. Tarda 1-2 días hábiles.'}
        </p>
      </GlowCard>
      
      <GlowCard className={status.payoutsEnabled ? 'success' : 'warning'}>
        <div className="status-header">
          <h3>Depósitos a tu banco</h3>
          {status.payoutsEnabled ? (
            <span className="badge success">✅ Habilitado</span>
          ) : (
            <span className="badge warning">⏳ Pendiente</span>
          )}
        </div>
        <p>
          {status.payoutsEnabled 
            ? 'Tus fondos se depositan automáticamente cada 2-3 días'
            : 'Stripe está validando tu cuenta bancaria.'}
        </p>
      </GlowCard>
    </div>
    
    {/* Balance */}
    <GlowCard>
      <h3>Balance disponible</h3>
      <div className="balance-display">
        <div className="balance-item">
          <span className="label">Disponible</span>
          <span className="amount">
            ${formatCurrency(status.balance.available[0]?.amount || 0)}
          </span>
          <small>Listo para transferir</small>
        </div>
        <div className="balance-item">
          <span className="label">Pendiente</span>
          <span className="amount">
            ${formatCurrency(status.balance.pending[0]?.amount || 0)}
          </span>
          <small>En proceso</small>
        </div>
      </div>
      
      <EventoraButton 
        variant="ghost"
        onClick={() => window.open('https://dashboard.stripe.com', '_blank')}
      >
        Ver en Stripe Dashboard
      </EventoraButton>
    </GlowCard>
    
    {/* Account Info */}
    <GlowCard>
      <h3>Información de la cuenta</h3>
      <div className="account-info">
        <div className="info-row">
          <span className="label">Account ID</span>
          <code>{status.accountId}</code>
        </div>
        <div className="info-row">
          <span className="label">Email</span>
          <span>{status.email}</span>
        </div>
        <div className="info-row">
          <span className="label">País</span>
          <span>{status.country?.toUpperCase()}</span>
        </div>
        <div className="info-row">
          <span className="label">Tipo de negocio</span>
          <span>{formatBusinessType(status.business_type)}</span>
        </div>
      </div>
    </GlowCard>
    
    {/* Actions */}
    <div className="actions">
      <EventoraButton onClick={loadStatus}>
        🔄 Actualizar estado
      </EventoraButton>
      
      <EventoraButton 
        variant="ghost"
        onClick={handleConnect}
      >
        Editar información en Stripe
      </EventoraButton>
    </div>
  </div>
);
```

### **Step 5: Auto-refresh después de onboarding**

```typescript
// Detectar return from Stripe
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('connected') === 'true') {
    // Poll status every 3 seconds for up to 30 seconds
    let attempts = 0;
    const maxAttempts = 10;
    
    const pollStatus = async () => {
      const data = await apiFetch<StripeStatus>('/api/v1/stripe/connect/status');
      setStatus(data);
      
      if (data.chargesEnabled || attempts >= maxAttempts) {
        clearInterval(interval);
        // Clean URL
        window.history.replaceState({}, '', '/settings/payments');
      }
      
      attempts++;
    };
    
    const interval = setInterval(pollStatus, 3000);
    pollStatus(); // First call immediately
    
    return () => clearInterval(interval);
  }
}, []);
```

---

## Files to Modify

1. **apps/web/src/app/(app)/settings/payments/page.tsx**
   - Reescribir completamente con nuevos estados
   - ~400-500 líneas (actualmente ~700)

2. **apps/api/src/modules/connect/connect.routes.ts**
   - Mejorar `/status` endpoint con balance y requirements

---

## Acceptance Criteria

1. **Given** cuenta sin Stripe, **When** abre /settings/payments, **Then** ve CTA claro para conectar
2. **Given** click en "Conectar", **When** completa Stripe onboarding, **Then** regresa y ve status actualizado
3. **Given** onboarding incompleto, **When** regresa, **Then** ve qué falta y puede continuar
4. **Given** cuenta completa, **When** ve página, **Then** ve badges de "charges enabled" y balance
5. **Given** regresa de Stripe, **When** página carga, **Then** auto-poll actualiza estado cada 3seg

---

## Test Evidence Required

**Manual:**
- [ ] Crear cuenta nueva sin Stripe
- [ ] Click "Conectar con Stripe"
- [ ] Completar onboarding con datos test
- [ ] Verificar que al regresar muestra status correcto
- [ ] Simular onboarding incompleto (salir a la mitad)
- [ ] Verificar que muestra requirements
- [ ] Click "Continuar" retoma correctamente
- [ ] Verificar balance display con transacciones test

**Automated:**
```typescript
test('stripe connect flow', async () => {
  await page.goto('/settings/payments');
  
  // Should show connect button
  await expect(page.locator('text=Conectar con Stripe')).toBeVisible();
  
  // (Mock stripe onboarding redirect)
  await page.goto('/settings/payments?connected=true');
  
  // Should poll and show status
  await expect(page.locator('text=✅ Habilitado')).toBeVisible({ timeout: 10000 });
});
```

---

## UX Checks

- [ ] Estados claros (not connected, incomplete, connected)
- [ ] Loading states durante fetch
- [ ] Poll status después de onboarding
- [ ] Success badges visuales
- [ ] Balance fácil de leer
- [ ] Link a Stripe Dashboard funciona
- [ ] Botón "Actualizar" funciona
- [ ] Help text útil en cada estado
- [ ] Mobile responsive

---

## Backend Requirements

**Mejorar endpoint existente:**
```
GET /api/v1/stripe/connect/status
```

**Nuevo response format:**
```json
{
  "connected": true,
  "accountId": "acct_xxx",
  "status": "active",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "detailsSubmitted": true,
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "pending_verification": []
  },
  "balance": {
    "available": [{ "amount": 150000, "currency": "mxn" }],
    "pending": [{ "amount": 50000, "currency": "mxn" }]
  },
  "capabilities": {
    "card_payments": "active",
    "transfers": "active"
  },
  "email": "admin@wellness.com",
  "country": "mx",
  "business_type": "company"
}
```

---

## Helper Functions

```typescript
function formatRequirement(req: string): string {
  const map: Record<string, string> = {
    'business_profile.url': 'Sitio web del negocio',
    'business_profile.mcc': 'Categoría del negocio',
    'external_account': 'Cuenta bancaria',
    'individual.id_number': 'RFC',
    'tos_acceptance.date': 'Aceptar términos de servicio',
    // ... más mappings
  };
  
  return map[req] || req;
}

function formatBusinessType(type: string): string {
  const map: Record<string, string> = {
    'individual': 'Persona física',
    'company': 'Persona moral',
    'non_profit': 'Organización sin fines de lucro',
  };
  
  return map[type] || type;
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
```

---

## Technical Notes

**Stripe Account statuses:**
- `charges_enabled: false` → No puede cobrar aún
- `charges_enabled: true` → Ya puede recibir pagos
- `payouts_enabled: false` → Fondos se retienen
- `payouts_enabled: true` → Depósitos automáticos activos

**Requirements types:**
- `currently_due` → URGENTE, debe completar ya
- `eventually_due` → Necesario pronto
- `pending_verification` → Stripe está revisando

**Balance:**
- `available` → Listo para transferir
- `pending` → En proceso (waiting period típico 2-3 días)

---

## Error Handling

```typescript
// Handle Stripe API errors gracefully
try {
  const status = await loadStatus();
} catch (error) {
  if (error.code === 'account_invalid') {
    // Account was deleted or restricted
    return showError('Tu cuenta de Stripe tiene un problema. Contacta a soporte.');
  }
  
  if (error.code === 'rate_limit') {
    // Too many requests
    return showError('Intenta de nuevo en unos segundos.');
  }
  
  // Generic error
  return showError('No pudimos cargar el estado. Intenta de nuevo.');
}
```

---

## Status

- Estado: TODO
- Owner: TBD
- Prioridad: CRÍTICA (sin esto no hay pagos)
- Estimado: 4h
- Sprint: Launch Week 1
- Relacionado: FRONT-B3 (pendiente)

---

## References

- [FRONTEND_INVENTORY.md](../FRONTEND_INVENTORY.md) - Gap #4
- [FRONT-B3.md](./FRONT-B3.md) - Ticket original
- [SALES_STRATEGY.md](../SALES_STRATEGY.md) - Fase 4: Step 4
- apps/web/src/app/(app)/settings/payments/page.tsx (archivo existente)
- apps/api/src/modules/connect/connect.routes.ts
