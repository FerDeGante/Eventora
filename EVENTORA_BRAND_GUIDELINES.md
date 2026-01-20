# 🌌 Eventora Brand Guidelines

## 1. Paleta de Colores

### Fondos (Cosmos)

| Color | Hex | Uso |
|-------|-----|-----|
| **Event Horizon** | `#020617` | Fondo principal de la app, hero, paneles oscuros |
| **Deep Space** | `#02081A` | Cards, modales, navbar elevados |
| **Starfield Navy** | `#0B1120` | Secciones especiales, gráficos, listas |

### Primario - "Aurora Blue" (Galaxia)

| Color | Hex | Uso |
|-------|-----|-----|
| **Aurora Light** | `#E0F2FE` | Fondos suaves, badges |
| **Aurora Blue** | `#38BDF8` | Color primario principal |
| **Aurora Deep** | `#0EA5E9` | Hover, énfasis, estados activos |

**Aplicación:** Botones primarios, links importantes, highlights

### Secundario - "Quantum Violet" (IA estilo Gemini)

| Color | Hex | Uso |
|-------|-----|-----|
| **Quantum Light** | `#DDD6FE` | Fondos suaves |
| **Quantum Violet** | `#6366F1` | Color secundario principal |
| **Quantum Deep** | `#4F46E5` | Hover, estados activos |

**Aplicación:** Botones secundarios, elementos de gráfico, tabs activos

### Acento - "Supernova" (Gemini multicolor)

| Color | Hex | Uso |
|-------|-----|-----|
| **Supernova Soft** | `#FDBA74` | Fondos suaves de acento |
| **Supernova** | `#F97316` | Chips, callouts, iconos destacados |

**⚠️ Nota:** Usar con moderación, como chispazos tipo Gemini, no como fondo everywhere

### Neutrales y Texto

| Color | Hex | Uso |
|-------|-----|-----|
| **Cosmic White** | `#F9FAFB` | Texto principal sobre oscuro |
| **Nebula Gray** | `#E5E7EB` | Texto secundario |
| **Orbit Gray** | `#9CA3AF` | Texto muted, labels |
| **Void Gray** | `#111827` | Texto sobre fondos claros |

### Colores Semánticos (UI SaaS)

| Estado | Hex | Uso |
|--------|-----|-----|
| **Success** | `#22C55E` | Estados exitosos, confirmaciones |
| **Warning** | `#EAB308` | Advertencias, alertas |
| **Error** | `#EF4444` | Errores, validaciones fallidas |

**Aplicación:** Solo para estados (pagos, status de eventos, validaciones de formularios)

---

## 2. Gradientes Cosmológicos

### Eventora Aurora (Gradiente de Marca)

```css
background: linear-gradient(135deg, #0EA5E9 0%, #6366F1 45%, #EC4899 100%);
```

**Descripción:** Azul → Violeta → Magenta suave

**Uso:**
- Botón CTA principal ("Crear evento", "Probar Eventora")
- Bordes destacados
- Detalles del logo en modo digital

### Eventora Cosmos (Fondo Cósmico)

```css
background: radial-gradient(circle at 20% 20%, #38BDF8 0, transparent 55%),
            radial-gradient(circle at 80% 80%, #F97316 0, transparent 60%),
            #020617;
```

**Descripción:** Azul galaxia + destello naranja supernova sobre negro

**Uso:**
- Hero de landing page
- Pantallas de login/registro
- Fondos de secciones destacadas

---

## 3. Tipografía

**Fuente Principal:** Inter (Google Fonts)
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Jerarquía

| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| **h1** | 3.5rem (56px) | 700 | Hero titles, títulos principales |
| **h2** | 2.5rem (40px) | 700 | Section titles |
| **h3** | 1.875rem (30px) | 600 | Subsection titles |
| **h4** | 1.25rem (20px) | 600 | Card titles |
| **h5** | 1.125rem (18px) | 600 | Small titles |
| **p** | 1rem (16px) | 400 | Body text |
| **small** | 0.875rem (14px) | 400 | Secondary text, labels |

**Letter-spacing:** -0.02em en h1/h2 para look moderno

---

## 4. Componentes UI

### Botones

#### Botón Primario
```css
background: var(--evt-gradient-aurora);
color: var(--evt-text);
padding: 0.875rem 1.75rem;
border-radius: 100px;
box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
```

**Hover:** `transform: translateY(-2px)` + aumentar shadow

#### Botón Secundario
```css
background: var(--evt-bg-elevated);
color: var(--evt-text);
border: 1px solid var(--evt-border);
border-radius: 100px;
```

**Hover:** `border-color: var(--evt-primary)`

### Cards

```css
background: var(--evt-bg-elevated);
border: 1px solid var(--evt-border);
border-radius: 1.5rem;
padding: 2rem;
```

**Hover:** `border-color: var(--evt-primary)` + glow azul

### Badges

```css
background: var(--evt-primary-light);
color: var(--evt-text-muted);
font-size: 0.75rem;
font-weight: 500;
letter-spacing: 0.1em;
text-transform: uppercase;
padding: 0.375rem 0.875rem;
border-radius: 100px;
```

---

## 5. Espaciado

Sistema basado en escala de 8px:

| Variable | Valor | Uso |
|----------|-------|-----|
| `--space-xs` | 0.5rem (8px) | Gaps pequeños |
| `--space-sm` | 1rem (16px) | Spacing interno |
| `--space-md` | 1.5rem (24px) | Spacing moderado |
| `--space-lg` | 2rem (32px) | Spacing entre elementos |
| `--space-xl` | 3rem (48px) | Padding de containers |
| `--space-2xl` | 4rem (64px) | Spacing de secciones |
| `--space-3xl` | 6rem (96px) | Padding vertical de secciones |

---

## 6. Border Radius

| Variable | Valor | Uso |
|----------|-------|-----|
| `--radius-sm` | 0.5rem (8px) | Inputs, chips pequeños |
| `--radius-md` | 1rem (16px) | Cards pequeños |
| `--radius-lg` | 1.5rem (24px) | Cards principales, modales |
| `--radius-full` | 100px | Botones, badges, pills |

---

## 7. Sombras

| Variable | Valor | Uso |
|----------|-------|-----|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.3)` | Elementos sutiles |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.3)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.4)` | Modales, overlays |
| `--shadow-aurora` | `0 0 20px rgba(56,189,248,0.3)` | Efectos de glow azul |

---

## 8. Transiciones

| Variable | Valor | Uso |
|----------|-------|-----|
| `--transition-fast` | `0.15s ease` | Hover states |
| `--transition-base` | `0.3s ease` | Transiciones generales |
| `--transition-slow` | `0.6s cubic-bezier(0.4,0,0.2,1)` | Animaciones complejas |

---

## 9. Aplicación Práctica

### Dashboard / App Interna

```css
body {
  background: var(--evt-bg);
  color: var(--evt-text);
}

.card {
  background: var(--evt-bg-elevated);
  border: 1px solid var(--evt-border);
}
```

### Hero Landing Page

```css
.hero {
  background: var(--evt-gradient-cosmos);
}

.cta-button {
  background: var(--evt-gradient-aurora);
  color: var(--evt-text);
}
```

### Navbar

```css
.navbar {
  background: var(--evt-bg-elevated);
  border-bottom: 1px solid var(--evt-border);
  backdrop-filter: blur(10px);
}
```

---

## 10. Inspiración Visual

**Estilo:** Gemini + Hawking + Cosmos

- **Oscuro y espacioso** (fondos cosmos)
- **Acentos vibrantes pero controlados** (aurora blue, quantum violet)
- **Gradientes cosmológicos** (aurora, cosmos)
- **Tipografía limpia** (Inter, pesos medios/bold)
- **Bordes redondeados** (1-1.5rem)
- **Glow effects** en elementos interactivos

---

## Variables CSS Completas

Ver `/apps/web/src/app/globals.css` para la implementación completa de todas las variables.
