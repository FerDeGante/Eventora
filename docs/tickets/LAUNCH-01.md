# LAUNCH-01 — Login con Workspace Detection

Title: Auto-redirect al workspace del usuario después del login
Priority: A (Crítico para lanzamiento)
Area: Auth / Frontend
Owner Role: Implementer
Estimate: 2 horas

---

## Problem (Evidence)

**Situación actual:**
- Usuario hace login en `/login`
- Recibe JWT con `clinicId` en el payload
- Redirige a `/dashboard` genérico
- Usuario debe navegar manualmente o conocer su `clinicId`

**Por qué es crítico:**
- Cliente no sabe su `clinicId`
- UX confusa para usuarios no técnicos
- Bloquea adopción en modelo "Servicio Administrado"

**Evidencia:**
```typescript
// apps/web/src/app/(auth)/login/page.tsx:37
if (response.accessToken) {
  auth.setSession(response.accessToken, { email });
  router.push("/dashboard"); // ❌ Siempre va aquí
}
```

---

## Goal

Usuario hace login → automáticamente ve dashboard de SU workspace, sin fricción.

---

## Scope

**In:**
- Extraer `clinicId` del JWT después del login
- Redirigir a dashboard con contexto correcto
- Manejar caso de usuario sin clinic (superadmin)
- Persistir última clinic visitada (localStorage)

**Out:**
- Selector de workspace múltiple (post-MVP)
- Workspace switching en runtime (post-MVP)

---

## Plan

### **Step 1: Login redirige con clinicId**

El JWT ya tiene el `clinicId`. Solo falta usarlo:

```typescript
// apps/web/src/app/(auth)/login/page.tsx

const handleLogin = async (event: FormEvent) => {
  // ... código existente ...
  
  if (response.accessToken) {
    auth.setSession(response.accessToken, { email });
    
    // ✅ Extraer user del token
    const user = auth.deriveUserFromToken(response.accessToken);
    
    if (user?.clinicId) {
      // Guardar en localStorage para próximos visits
      localStorage.setItem('lastClinicId', user.clinicId);
      router.push("/dashboard");
    } else {
      // Caso edge: superadmin sin clinic
      router.push("/select-workspace");
    }
  }
}
```

### **Step 2: Dashboard usa clinicId del contexto**

El dashboard ya debería estar usando el `clinicId` del JWT para queries. Verificar que todas las llamadas API incluyan el header correcto:

```typescript
// apps/web/src/lib/api-client.ts

export async function apiFetch<T>(url: string, options?: ApiFetchOptions): Promise<T> {
  const token = localStorage.getItem('accessToken');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };
  
  // ✅ El backend ya extrae clinicId del JWT
  // No hace falta pasarlo manualmente
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    body: options?.json ? JSON.stringify(options.json) : options?.body,
  });
  
  // ... resto del código ...
}
```

### **Step 3: Manejar caso sin workspace (opcional)**

Para usuarios que no tienen `clinicId` asignado (edge case):

```typescript
// apps/web/src/app/select-workspace/page.tsx

export default function SelectWorkspacePage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  
  useEffect(() => {
    // Fetch workspaces del usuario
    apiFetch<{ clinics: Clinic[] }>('/api/v1/users/me/clinics')
      .then(data => setWorkspaces(data.clinics));
  }, []);
  
  const handleSelect = (clinicId: string) => {
    localStorage.setItem('lastClinicId', clinicId);
    router.push('/dashboard');
  };
  
  return (
    <div>
      <h1>Selecciona tu workspace</h1>
      {workspaces.map(clinic => (
        <button key={clinic.id} onClick={() => handleSelect(clinic.id)}>
          {clinic.name}
        </button>
      ))}
    </div>
  );
}
```

---

## Files to Modify

1. **apps/web/src/app/(auth)/login/page.tsx**
   - Línea 37: Agregar lógica de redirect con clinicId
   - Importar `useAuth` si no está

2. **apps/web/src/app/hooks/useAuth.tsx**
   - Verificar que `deriveUserFromToken` exponga `clinicId`
   - Ya está implementado en FRONT-B4 ✅

3. **apps/web/src/app/select-workspace/page.tsx** (crear si es necesario)
   - Página para usuarios sin clinic asignada
   - Solo si hay casos de multi-workspace

---

## Acceptance Criteria

1. **Given** usuario con clinic asignada, **When** hace login, **Then** ve dashboard de su workspace inmediatamente
2. **Given** usuario hace logout, **When** vuelve a entrar, **Then** ve el mismo workspace
3. **Given** usuario sin clinic (edge case), **When** hace login, **Then** ve página para seleccionar workspace
4. **Given** usuario en dashboard, **When** recarga página, **Then** mantiene contexto de workspace

---

## Test Evidence Required

**Manual:**
- [ ] Login con usuario de "Wellness Center" → dashboard muestra datos de esa clinic
- [ ] Login con usuario de "Yoga Studio" → dashboard muestra datos correctos
- [ ] Recargar página mantiene contexto
- [ ] Logout → Login nuevamente funciona

**Automated (opcional post-MVP):**
```typescript
test('redirects to dashboard with correct workspace', async () => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@wellness.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('/dashboard');
  
  // Verificar que datos son de wellness center
  const heading = await page.textContent('h1');
  expect(heading).toContain('Wellness Center');
});
```

---

## UX Checks

- [ ] Login flow es transparente (sin pasos extra)
- [ ] No hay flicker de "workspace incorrecto"
- [ ] Loading states durante redirect
- [ ] Error handling si clinicId no existe en DB

---

## Backend Requirements

**Ninguno nuevo.** El backend ya:
- ✅ Incluye `clinicId` en JWT payload
- ✅ Valida tenant en cada request
- ✅ Retorna datos filtrados por clinic

Verificar que `GET /api/v1/users/me` incluya:
```json
{
  "id": "xxx",
  "email": "admin@wellness.com",
  "role": "ADMIN",
  "clinicId": "clinic_123",
  "clinic": {
    "id": "clinic_123",
    "name": "Wellness Center",
    "slug": "wellness-center"
  }
}
```

---

## Technical Notes

**JWT payload actual:**
```json
{
  "sub": "user_id",
  "email": "admin@wellness.com",
  "role": "ADMIN",
  "clinicId": "clinic_123",
  "iat": 1737500000,
  "exp": 1737586400
}
```

**LocalStorage keys:**
```
accessToken: "eyJhbGc..."
lastClinicId: "clinic_123" (nuevo)
```

---

## Dependencies

- ✅ FRONT-B4 ya implementó `user.id` en JWT
- ⚠️ Verificar que `clinicId` esté en JWT (debería estar)

---

## Status

- Estado: TODO
- Owner: TBD
- Prioridad: CRÍTICA (bloquea lanzamiento)
- Estimado: 2h
- Sprint: Launch Week 1

---

## References

- [FRONTEND_INVENTORY.md](../FRONTEND_INVENTORY.md) - Gap #1
- [SALES_STRATEGY.md](../SALES_STRATEGY.md) - Fase 4: Onboarding
- apps/web/src/app/hooks/useAuth.tsx (línea 47-57)
