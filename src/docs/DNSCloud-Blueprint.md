# DNSCloud — Custom Knowledge Blueprint (Fuente de verdad)

> Este documento es la referencia principal para decisiones de arquitectura, UI/UX y reglas de módulos.

## Objetivo

DNSCloud es una plataforma corporativa modular. Todos los usuarios ingresan por un Shell central (una sola app) y acceden a módulos: Seguridad, Empleados, Equipos, Movimientos, Partes Diarios, Habilitaciones, y otros futuros.

---

## Regla N°1: Seguridad global (RBAC multi-empresa)

Existe un **Módulo de Seguridad** central que administra globalmente:

- **Empresas** (tenant/empresaId)
- **Usuarios**
- **Roles**
- **Permisos**

Cada módulo debe exponer su catálogo (permisos + rutas + navegación) para administración global desde Seguridad.

---

## Arquitectura (monolito modular)

- 1 app (Shell) con módulos aislados por carpeta.
- Shell/Core gestiona: auth, layout, theme, routing, guards, breadcrumbs.
- Cada módulo tiene: `pages/components/services` + `manifest.ts` obligatorio.

### Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         SHELL (Core)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │  Auth   │ │ Layout  │ │  Theme  │ │ Routing │ │ Guards │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Seguridad    │  │  Partes Diarios │  │   Calendario    │
│   manifest.ts   │  │   manifest.ts   │  │   manifest.ts   │
│   pages/        │  │   pages/        │  │   pages/        │
│   components/   │  │   components/   │  │   components/   │
│   services/     │  │   services/     │  │   services/     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Contrato obligatorio de módulo (manifest.ts)

Todo módulo debe declarar:

```typescript
// Ejemplo: src/modules/equipos/manifest.ts
export const equiposManifest = {
  moduleId: 'equipos',
  name: 'Equipos',
  permissions: [
    { key: 'equipos.read', description: 'Ver equipos' },
    { key: 'equipos.create', description: 'Crear equipos' },
    { key: 'equipos.update', description: 'Editar equipos' },
    { key: 'equipos.delete', description: 'Eliminar equipos' },
  ],
  routes: [
    { path: '/equipos', requiredPermissions: ['equipos.read'] },
    { path: '/equipos/nuevo', requiredPermissions: ['equipos.create'] },
    { path: '/equipos/:id', requiredPermissions: ['equipos.read'] },
  ],
  navItems: [
    { label: 'Equipos', path: '/equipos', requiredPermissions: ['equipos.read'] },
  ],
};
```

El Shell arma rutas y menú leyendo manifests desde `src/app/moduleRegistry.ts`.

---

## Reglas de autorización

| Concepto | Implementación |
|----------|----------------|
| Rutas protegidas | RouteGuard valida permisos |
| Acciones UI | Botones/menús se ocultan por permisos |
| Filtrado de datos | Siempre filtrar por `empresaId` |

### Ejemplo de RouteGuard

```typescript
const RouteGuard = ({ requiredPermissions, children }) => {
  const { user, hasPermission } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  const hasAccess = requiredPermissions.every(p => hasPermission(p));
  if (!hasAccess) return <Navigate to="/unauthorized" />;
  
  return children;
};
```

---

## Estructura de repo (obligatoria)

```
src/
├── core/                    # Shell principal
│   ├── auth/               # Autenticación
│   ├── routing/            # Router y guards
│   ├── layout/             # AppLayout, Sidebar, Header
│   ├── theme/              # ThemeProvider
│   └── security/           # Contexto de permisos
│
├── shared/                  # Componentes reutilizables
│   ├── components/         # UI components compartidos
│   ├── hooks/              # Hooks compartidos
│   ├── utils/              # Utilidades
│   └── types/              # Tipos compartidos
│
├── modules/                 # Módulos de negocio
│   ├── seguridad/          # Módulo de seguridad
│   │   ├── manifest.ts
│   │   ├── pages/
│   │   ├── components/
│   │   └── services/
│   ├── partes-diarios/
│   ├── equipos/
│   └── calendario/
│
├── app/
│   └── moduleRegistry.ts   # Registro único de manifests
│
└── docs/
    └── DNSCloud-Blueprint.md
```

---

## UI/UX estándar (F2.4)

### Tema "Aesthetic Clinic"

Estilo limpio, moderno, calmado.

### Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | #FFFFFF | Fondo principal |
| `--primary` | #22C55E | Acciones principales |
| `--muted` | #F0FDFA | Fondos secundarios |
| `--foreground` | Grises elegantes | Texto |

### Tipografía

- **Font family**: Plus Jakarta Sans
- **Weights**: 400, 500, 600, 700

### Componentes

- Librería base: **shadcn/ui**
- Animaciones: sutiles (fade/slide)
- Breadcrumbs: en toda la plataforma

### Layout estilo HubSpot

```
┌──────────────────────────────────────────────────────────┐
│  Logo   │          Top Bar              │  User Avatar  │
├─────────┼────────────────────────────────────────────────┤
│         │                                                │
│ Sidebar │              Main Content                      │
│  (col-  │                                                │
│  lapsi- │                                                │
│   ble)  │                                                │
│         │                                                │
└─────────┴────────────────────────────────────────────────┘
```

---

## Método de trabajo por iteraciones

Implementar módulos por **"vertical slices"**:

1. **UI** - Diseño de pantallas
2. **Data** - Integración con Supabase
3. **Permisos** - Validación RBAC
4. **Validaciones** - Forms y reglas de negocio
5. **Edge cases** - Manejo de errores

### Regla importante

> No duplicar layout por módulo: todo usa el Shell.

---

## Base de datos (Supabase)

### Tablas principales de seguridad

| Tabla | Descripción |
|-------|-------------|
| `seg_empresas` | Tenants/empresas |
| `seg_usuarios` | Usuarios del sistema |
| `seg_roles` | Roles por empresa |
| `seg_permisos` | Catálogo de permisos |
| `seg_rol_permiso` | Relación rol-permisos |
| `seg_usuario_rol` | Asignación usuario-rol-aplicación |
| `seg_aplicaciones` | Módulos/aplicaciones del sistema |

### Políticas RLS

Todas las tablas deben tener RLS habilitado y filtrar por `empresa_id` cuando corresponda.

---

## Convenciones de código

### Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `UserCard.tsx` |
| Hooks | camelCase con prefix `use` | `useAuth.ts` |
| Permisos | `modulo.accion` | `equipos.read` |
| Archivos | kebab-case o PascalCase | `user-service.ts` |

### Imports

```typescript
// 1. React/externos
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Componentes UI
import { Button } from '@/components/ui/button';

// 3. Componentes propios
import { UserCard } from '@/modules/seguridad/components/UserCard';

// 4. Hooks/utils
import { useAuth } from '@/contexts/AuthContext';

// 5. Types
import type { User } from '@/types/auth';
```

---

## Checklist para nuevos módulos

- [ ] Crear carpeta en `src/modules/<nombre>/`
- [ ] Crear `manifest.ts` con permisos, rutas y navItems
- [ ] Registrar en `moduleRegistry.ts`
- [ ] Crear páginas en `pages/`
- [ ] Agregar entrada en `seg_aplicaciones`
- [ ] Definir permisos en `seg_permisos`
- [ ] Crear políticas RLS si hay tablas nuevas
- [ ] Implementar UI siguiendo el design system
- [ ] Documentar en este Blueprint si es necesario

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2025-01-XX | Documento inicial creado |
