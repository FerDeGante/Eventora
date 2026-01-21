# LAUNCH-05 — Script de Creación de Clientes

Title: Herramienta CLI para crear clientes rápidamente (manual setup)
Priority: B (Importante para onboarding manual)
Area: DevOps / Tooling
Owner Role: Implementer
Estimate: 2 horas

---

## Problem (Evidence)

**Situación actual:**
- Para crear un nuevo cliente, hay que:
  1. Hacer signup completo en UI (lento)
  2. O crear manualmente en DB con SQL (error-prone)
  3. O usar Postman con múltiples requests

**Por qué es importante:**
- En modelo "Servicio Administrado", TÚ haces el setup
- Necesitas crear clientes en minutos, no horas
- Debe ser repetible y sin errores
- Permite demo rápidas con datos reales

---

## Goal

Script CLI que en 1 comando crea:
- ✅ Workspace (clinic)
- ✅ Usuario admin del workspace
- ✅ Sucursal principal (branch)
- ✅ (Opcional) Servicios de prueba

**Uso:**
```bash
npm run create-client -- \
  --name "Wellness Center" \
  --slug wellness-center \
  --email admin@wellness.com \
  --password SecurePass123! \
  --demo true
```

---

## Scope

**In:**
- Script CLI interactivo
- Crear clinic, user, branch en una operación
- Validación de inputs (slug único, email válido, etc.)
- Opción `--demo` para agregar servicios de prueba
- Output con credenciales y URLs importantes

**Out:**
- Configuración avanzada (horarios, integraciones)
- Carga de servicios desde CSV
- Configuración de Stripe Connect (manual por ahora)
- Import de datos desde otros sistemas

---

## Plan

### **Script Principal**

```typescript
// scripts/create-client.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface ClientInput {
  name: string;
  slug: string;
  email: string;
  password: string;
  demo?: boolean;
}

async function createClient(input: ClientInput) {
  console.log('🚀 Creando nuevo cliente...\n');
  
  // 1. Validar slug único
  const existingClinic = await prisma.clinic.findUnique({
    where: { slug: input.slug }
  });
  
  if (existingClinic) {
    throw new Error(`❌ El slug "${input.slug}" ya está en uso`);
  }
  
  // 2. Validar email único
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });
  
  if (existingUser) {
    throw new Error(`❌ El email "${input.email}" ya está registrado`);
  }
  
  // 3. Crear Clinic
  console.log('📍 Creando workspace...');
  const clinic = await prisma.clinic.create({
    data: {
      name: input.name,
      slug: input.slug,
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      timezone: 'America/Mexico_City',
      currency: 'MXN',
      setupCompleted: input.demo ? true : false,
      setupStep: input.demo ? 4 : 1,
    }
  });
  
  console.log(`✅ Workspace creado: ${clinic.id}`);
  
  // 4. Crear Branch principal
  console.log('🏢 Creando sucursal principal...');
  const branch = await prisma.branch.create({
    data: {
      clinicId: clinic.id,
      name: input.name + ' - Principal',
      address: 'Por configurar',
      phone: 'Por configurar',
      email: input.email,
      timezone: 'America/Mexico_City',
      isActive: true,
    }
  });
  
  console.log(`✅ Sucursal creada: ${branch.id}`);
  
  // 5. Crear Usuario Admin
  console.log('👤 Creando usuario admin...');
  const hashedPassword = await bcrypt.hash(input.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name + ' Admin',
      role: 'ADMIN',
      clinicId: clinic.id,
    }
  });
  
  console.log(`✅ Usuario admin creado: ${user.id}`);
  
  // 6. Crear servicios de demo si se solicitó
  if (input.demo) {
    console.log('🎯 Creando servicios de demo...');
    
    const demoServices = [
      {
        name: 'Yoga 60 min',
        description: 'Clase de yoga para todos los niveles',
        duration: 60,
        price: 35000, // $350 MXN
        capacity: 15,
        category: 'CLASS' as const,
      },
      {
        name: 'Pilates Reformer',
        description: 'Sesión individual de pilates con reformer',
        duration: 50,
        price: 65000, // $650 MXN
        capacity: 1,
        category: 'SESSION' as const,
      },
      {
        name: 'Masaje Relajante',
        description: 'Masaje de cuerpo completo',
        duration: 90,
        price: 80000, // $800 MXN
        capacity: 1,
        category: 'SESSION' as const,
      },
      {
        name: 'Spinning',
        description: 'Clase de ciclismo indoor',
        duration: 45,
        price: 25000, // $250 MXN
        capacity: 20,
        category: 'CLASS' as const,
      },
    ];
    
    for (const service of demoServices) {
      await prisma.service.create({
        data: {
          ...service,
          clinicId: clinic.id,
          branchId: branch.id,
          isActive: true,
        }
      });
    }
    
    console.log(`✅ ${demoServices.length} servicios creados`);
    
    // 7. Crear template de horario de demo
    console.log('📅 Creando horario de operación...');
    await prisma.availabilityTemplate.create({
      data: {
        clinicId: clinic.id,
        branchId: branch.id,
        name: 'Horario Principal',
        slots: {
          monday: {
            enabled: true,
            slots: generateTimeSlots('09:00', '20:00', 60)
          },
          tuesday: {
            enabled: true,
            slots: generateTimeSlots('09:00', '20:00', 60)
          },
          wednesday: {
            enabled: true,
            slots: generateTimeSlots('09:00', '20:00', 60)
          },
          thursday: {
            enabled: true,
            slots: generateTimeSlots('09:00', '20:00', 60)
          },
          friday: {
            enabled: true,
            slots: generateTimeSlots('09:00', '20:00', 60)
          },
          saturday: {
            enabled: true,
            slots: generateTimeSlots('10:00', '14:00', 60)
          },
          sunday: {
            enabled: false,
            slots: []
          },
        }
      }
    });
    
    console.log(`✅ Horario configurado`);
  }
  
  // 8. Output final
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Cliente creado exitosamente!');
  console.log('='.repeat(60) + '\n');
  
  console.log('📋 Credenciales:');
  console.log(`   Email:    ${input.email}`);
  console.log(`   Password: ${input.password}`);
  console.log('');
  
  console.log('🔗 URLs importantes:');
  console.log(`   Login:    https://eventora.com/login`);
  console.log(`   Dashboard: https://eventora.com/dashboard`);
  console.log(`   Booking:   https://eventora.com/book/${input.slug}`);
  console.log('');
  
  console.log('🆔 IDs (para referencia):');
  console.log(`   Clinic ID: ${clinic.id}`);
  console.log(`   Branch ID: ${branch.id}`);
  console.log(`   User ID:   ${user.id}`);
  console.log('');
  
  if (input.demo) {
    console.log('✨ Workspace incluye:');
    console.log(`   - 4 servicios de ejemplo`);
    console.log(`   - Horario Lun-Sab configurado`);
    console.log(`   - Setup marcado como completo`);
  } else {
    console.log('⚠️  Próximos pasos:');
    console.log(`   1. Configurar servicios en /services`);
    console.log(`   2. Configurar horarios en /settings`);
    console.log(`   3. Conectar Stripe en /settings/payments`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

function generateTimeSlots(start: string, end: string, interval: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += interval;
  }
  
  return slots;
}

// CLI Interface
async function promptInput(): Promise<ClientInput> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };
  
  console.log('🚀 Eventora - Crear Nuevo Cliente\n');
  
  const name = await question('Nombre del negocio: ');
  const slug = await question('Slug (URL): ');
  const email = await question('Email del admin: ');
  const password = await question('Password: ');
  const demoResponse = await question('¿Incluir datos de demo? (s/n): ');
  
  rl.close();
  
  return {
    name,
    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    email,
    password,
    demo: demoResponse.toLowerCase() === 's'
  };
}

// Main execution
async function main() {
  try {
    // Parse CLI args or prompt
    const args = process.argv.slice(2);
    
    let input: ClientInput;
    
    if (args.includes('--interactive')) {
      input = await promptInput();
    } else {
      // Parse flags
      input = {
        name: getArg('--name', args) || '',
        slug: getArg('--slug', args) || '',
        email: getArg('--email', args) || '',
        password: getArg('--password', args) || '',
        demo: args.includes('--demo')
      };
      
      // Validate required fields
      if (!input.name || !input.slug || !input.email || !input.password) {
        console.error('❌ Faltan argumentos requeridos');
        console.log('\nUso:');
        console.log('  npm run create-client -- --name "Name" --slug slug --email email@example.com --password pass [--demo]');
        console.log('  npm run create-client -- --interactive');
        process.exit(1);
      }
    }
    
    await createClient(input);
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function getArg(flag: string, args: string[]): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
}

main();
```

---

### **Package.json Script**

```json
// package.json (root)
{
  "scripts": {
    "create-client": "tsx scripts/create-client.ts"
  }
}
```

---

## Files to Create

1. **scripts/create-client.ts** - Main script (~250 líneas)

---

## Files to Modify

1. **package.json** (root)
   - Agregar script `create-client`
   
2. **prisma/schema.prisma**
   - Verificar que campos `setupCompleted` y `setupStep` existan

---

## Usage Examples

### **Modo interactivo:**
```bash
npm run create-client -- --interactive

# Prompts:
# Nombre del negocio: Wellness Center
# Slug (URL): wellness-center
# Email del admin: admin@wellness.com
# Password: SecurePass123!
# ¿Incluir datos de demo? (s/n): s
```

### **Modo CLI:**
```bash
npm run create-client -- \
  --name "Yoga Studio Polanco" \
  --slug yoga-polanco \
  --email admin@yoga-polanco.com \
  --password YogaPass2026! \
  --demo
```

### **Producción (sin demo):**
```bash
npm run create-client -- \
  --name "Spa Reforma" \
  --slug spa-reforma \
  --email contacto@spareforma.mx \
  --password RealPassword!
```

---

## Output Example

```
🚀 Creando nuevo cliente...

📍 Creando workspace...
✅ Workspace creado: cm5xyz123abc

🏢 Creando sucursal principal...
✅ Sucursal creada: cm5branch456

👤 Creando usuario admin...
✅ Usuario admin creado: cm5user789

🎯 Creando servicios de demo...
✅ 4 servicios creados

📅 Creando horario de operación...
✅ Horario configurado

============================================================
🎉 Cliente creado exitosamente!
============================================================

📋 Credenciales:
   Email:    admin@wellness.com
   Password: SecurePass123!

🔗 URLs importantes:
   Login:     https://eventora.com/login
   Dashboard: https://eventora.com/dashboard
   Booking:   https://eventora.com/book/wellness-center

🆔 IDs (para referencia):
   Clinic ID: cm5xyz123abc
   Branch ID: cm5branch456
   User ID:   cm5user789

✨ Workspace incluye:
   - 4 servicios de ejemplo
   - Horario Lun-Sab configurado
   - Setup marcado como completo

============================================================
```

---

## Acceptance Criteria

1. **Given** comando con todos los args, **When** ejecuta, **Then** crea cliente completo en <10 segundos
2. **Given** slug duplicado, **When** ejecuta, **Then** muestra error claro
3. **Given** flag `--demo`, **When** ejecuta, **Then** incluye 4 servicios y horarios
4. **Given** modo interactivo, **When** ejecuta, **Then** guía paso a paso
5. **Given** cliente creado, **When** hace login, **Then** puede entrar inmediatamente

---

## Test Evidence Required

**Manual:**
- [ ] Ejecutar en modo interactivo → cliente creado
- [ ] Ejecutar con CLI args → cliente creado
- [ ] Ejecutar con `--demo` → servicios incluidos
- [ ] Ejecutar sin `--demo` → solo workspace básico
- [ ] Intentar slug duplicado → error claro
- [ ] Login con credenciales generadas → funciona

---

## Error Handling

```typescript
// En el script
try {
  await createClient(input);
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    console.error('❌ El slug o email ya existe');
  } else if (error.code === 'P2003') {
    // Foreign key constraint
    console.error('❌ Error de relación en base de datos');
  } else {
    console.error('❌ Error inesperado:', error.message);
  }
  
  process.exit(1);
}
```

---

## Security Notes

⚠️ **Password en plaintext:**
- Script es para uso interno/dev
- En producción, usar variables de entorno
- No commitear scripts con passwords reales

**Mejora futura:**
```typescript
const password = process.env.CLIENT_PASSWORD || await question('Password: ');
```

---

## Integration with Onboarding Process

Este script complementa el flujo de "Servicio Administrado":

1. **Demo con prospecto:** Usar script con `--demo` para mostrar sistema funcionando
2. **Cierre de venta:** Cobrar setup fee
3. **Onboarding:** Ejecutar script con datos reales del cliente
4. **Configuración:** TÚ agregas servicios específicos y configuraciones
5. **Capacitación:** Cliente entra con credenciales generadas
6. **Go-live:** Cliente empieza a usar

---

## Future Enhancements (Post-MVP)

- [ ] Import servicios desde CSV
- [ ] Crear usuarios staff adicionales
- [ ] Configurar integraciones (Stripe, etc.)
- [ ] Dry-run mode (mostrar qué haría sin ejecutar)
- [ ] Rollback automático en caso de error
- [ ] Template de configuraciones comunes (gym, spa, yoga, etc.)

---

## Status

- Estado: TODO
- Owner: TBD
- Prioridad: IMPORTANTE (no crítico pero muy útil)
- Estimado: 2h
- Sprint: Launch Week 1

---

## References

- [SALES_STRATEGY.md](../SALES_STRATEGY.md) - Fase 4: Onboarding Manual
- prisma/seed.ts (inspiración)
- apps/api/src/modules/onboarding/onboarding.service.ts (signup logic)
