# Design System — Eventora

> **Estilo:** iOS-like, Apple-inspired, Chrome/Gemini aesthetic  
> **Referencia:** `/EVENTORA_BRAND_GUIDELINES.md`

---

## Principios

1. **Minimalista** — Menos es más, sin ruido visual
2. **Premium** — Sensación de calidad en cada interacción
3. **Calmado** — Colores suaves, no saturados
4. **Claro** — Jerarquía tipográfica evidente
5. **Responsivo** — Mobile-first, funciona en cualquier pantalla

---

## Tokens de Diseño

### Colores (Brand)
```css
--eventora-primary: #1A73E8;      /* Azul principal */
--eventora-primary-hover: #1557B0;
--eventora-accent: #8AB4F8;       /* Azul claro (dark mode) */
--eventora-success: #34A853;
--eventora-warning: #FBBC04;
--eventora-error: #EA4335;
--eventora-neutral-50: #F8F9FA;
--eventora-neutral-100: #F1F3F4;
--eventora-neutral-200: #E8EAED;
--eventora-neutral-500: #9AA0A6;
--eventora-neutral-700: #5F6368;
--eventora-neutral-900: #202124;
```

### Espaciado (escala 4px)
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;  /* Pills, avatars */
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
--shadow-lg: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
--shadow-glow: 0 0 20px rgba(26,115,232,0.3);
```

### Tipografía
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', Consolas, monospace;

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
```

---

## Componentes Implementados

### Buttons
| Componente | Ubicación | Variantes |
|------------|-----------|-----------|
| `EventoraButton` | `components/ui/EventoraButton.tsx` | `primary`, `ghost` |
| `BloomButton` | `components/ui/BloomButton.tsx` | `solid`, `ghost` (Framer Motion) |

**Props:**
```typescript
interface EventoraButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
```

### Cards
| Componente | Ubicación | Uso |
|------------|-----------|-----|
| `GlowCard` | `components/ui/GlowCard.tsx` | Cards con efecto glow |
| `SectionHeading` | `components/ui/SectionHeading.tsx` | Headers de sección |
| `KpiBar` | `components/ui/KpiBar.tsx` | Métricas dashboard |

### Forms
| Componente | Ubicación |
|------------|-----------|
| `InputField` | `components/ui/InputField.tsx` |

### Layout
| Componente | Ubicación |
|------------|-----------|
| `DashboardLayout` | `components/DashboardLayout.tsx` |
| `Sidebar` | `components/Sidebar.tsx` |
| `AuthCard` | `components/auth/AuthCard.tsx` |

---

## Estados de UI

### Loading
- Usar skeleton loaders, no spinners genéricos
- Mantener layout estable (no saltos)

### Empty States
- Siempre incluir:
  - Ilustración o icono sutil
  - Mensaje descriptivo
  - CTA primario

### Error States
- Mensaje claro del problema
- Acción de recuperación
- No usar códigos técnicos para usuarios

### Success Feedback
- Toast sutil (no modal intrusivo)
- Duración: 3-5 segundos
- Auto-dismiss

---

## Microinteracciones

| Tipo | Duración | Easing |
|------|----------|--------|
| Hover | 150ms | ease-out |
| Button press | 100ms | ease-in-out |
| Modal open | 200ms | ease-out |
| Toast | 250ms | ease-out |
| Page transition | 300ms | ease-in-out |

---

## Pantallas MVP

### ✅ Implementadas
- [x] Landing page (`/`)
- [x] Login con 2FA (`/login`)
- [x] Register (`/register`)
- [x] Reset password (`/reset`)
- [x] Dashboard (`/dashboard`)
- [x] Booking wizard (`/wizard`)
- [x] POS (`/pos`)
- [x] Notifications (`/notifications`)
- [x] Marketplace (`/marketplace`)

### ⚠️ Pendientes
- [ ] Clients list + profile (`/clients`)
- [ ] Calendar view (`/calendar`)
- [ ] Services admin (`/services`)
- [ ] Settings (`/settings`)

---

## Accesibilidad

### Requisitos mínimos
- [ ] Focus visible en todos los interactivos
- [ ] Contraste WCAG AA (4.5:1 texto, 3:1 gráficos)
- [ ] Labels en todos los inputs
- [ ] Aria-labels en iconos sin texto
- [ ] Keyboard navigation completa

### Testing
```bash
# Lighthouse accessibility audit
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

---

## Referencias

- [EVENTORA_BRAND_GUIDELINES.md](/EVENTORA_BRAND_GUIDELINES.md)
- [Tailwind Config](/apps/web/tailwind.config.js)
- [Global Styles](/apps/web/src/styles/)

---

*Última actualización: 19 enero 2026*