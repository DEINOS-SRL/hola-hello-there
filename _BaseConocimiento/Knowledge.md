# DNSCloud — Custom Knowledge Blueprint (Fuente de verdad)

> Documento extendido (repo): `docs/DNSCloud-Blueprint.md`
> Este Custom Knowledge es la referencia principal para decisiones de arquitectura, UI/UX y reglas de módulos.

## Objetivo
DNSCloud es una plataforma corporativa modular. Todos los usuarios ingresan por un Shell central (una sola app) y acceden a módulos: Seguridad, Empleados, Equipos, Movimientos, Partes Diarios, Habilitaciones, y otros futuros.

## Regla N°1: Seguridad global (RBAC multi-empresa)
Existe un Módulo de Seguridad central que administra globalmente:
- Empresas (tenant/empresaId)
- Secciones
- Modulos
- Funcionalidades
- Usuarios
- Roles
- Permisos

Cada módulo debe exponer su catálogo (funcionalidad + rutas + navegación) para administración global desde Seguridad.
La Jerarquia de Conceptos en Plataforma Saas DNSCloud -> Plataforma/Sección/Módulo/Funcionalidad

ver detalle de seguridad en /src/modules/security/Context_Seguridad.md


## Arquitectura (monolito modular)
- 1 app (Shell) con módulos aislados por carpeta.
- Shell/Core gestiona: auth, layout, theme, routing, guards, breadcrumbs.
- Cada módulo tiene: pages/components/services + `manifest.ts` obligatorio.

## Contrato obligatorio de módulo (manifest.ts)
Todo módulo debe declarar:
- moduleId, name
- permissions (keys tipo `<modulo>.<accion>` ej: `equipos.read`)
- routes (path + requiredPermissions)
- navItems (label + requiredPermissions)
El Shell arma rutas y menú leyendo manifests desde `src/app/moduleRegistry.ts`.

## Reglas de autorización
- Rutas protegidas por permisos (RouteGuard).
- Acciones UI (botones/menús) también se ocultan por permisos (no solo rutas).
- Siempre filtrar datos por `empresaId`.

## Estructura de repo (obligatoria)
- `src/core/` auth/routing/layout/theme/security
- `src/shared/` componentes reutilizables, hooks, utils, types
- `src/modules/<module>/` manifest.ts + pages/components/services
- `src/app/moduleRegistry.ts` único registro de manifests

## UI/UX estándar (F2.4)
Tema “Aesthetic Clinic”: limpio, moderno, calmado.
- Colores: #FFFFFF, #F0FDFA, #22C55E + grises elegantes
- Tipografía: Plus Jakarta Sans
- Componentes: shadcn/ui
- Animaciones sutiles (fade/slide)
- Breadcrumbs en toda la plataforma
- Theme claro/oscuro
- Estilo HubSpot: sidebar/drawer colapsable + topbar + usuario arriba derecha

## Método de trabajo por iteraciones
Implementar módulos por “vertical slices”: UI + data + permisos + validaciones + edge cases.
No duplicar layout por módulo: todo usa el Shell.


## Estilo Visual (Aesthetic Clinic Theme)

### Colores HSL
**Light Mode:**
- Background: 0 0% 100% (blanco)
- Foreground: 200 15% 15% (gris oscuro elegante)
- Primary: 174 62% 32% (teal #2D8B7A)
- Primary Foreground: 0 0% 100% (blanco)
- Secondary: 166 76% 97% (#F0FDFA - teal muy claro)
- Secondary Foreground: 174 62% 32%
- Muted: 210 20% 96%
- Muted Foreground: 215 16% 47%
- Accent: 166 76% 94%
- Accent Foreground: 174 62% 28%
- Success: 142 71% 45%
- Warning: 38 92% 50%
- Destructive: 0 84% 60%
- Border: 210 20% 90%
- Ring: 174 62% 32%
- Radius: 0.75rem

**Sidebar Light:**
- Background: 0 0% 99%
- Foreground: 200 15% 25%
- Primary: 174 62% 32%
- Accent: 166 76% 97%
- Border: 210 20% 92%

**Dark Mode:**
- Background: 200 20% 8%
- Foreground: 166 20% 95%
- Primary: 174 55% 45%
- Primary Foreground: 200 20% 8%
- Secondary: 200 18% 16%
- Muted: 200 18% 18%
- Border: 200 18% 20%

**Sidebar Dark:**
- Background: 200 18% 10%
- Foreground: 166 20% 90%
- Primary: 174 55% 45%

### Gradientes
- gradient-hero: linear-gradient(135deg, hsl(166 76% 97%) 0%, hsl(174 40% 92%) 100%)
- gradient-card: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(166 50% 99%) 100%)
- gradient-primary: linear-gradient(135deg, hsl(174 62% 32%) 0%, hsl(174 62% 42%) 100%)

### Sombras
- shadow-sm: 0 1px 2px 0 hsl(200 15% 15% / 0.05)
- shadow-md: 0 4px 6px -1px hsl(200 15% 15% / 0.1)
- shadow-lg: 0 10px 15px -3px hsl(200 15% 15% / 0.1)
- shadow-glow: 0 0 40px hsl(174 62% 32% / 0.15)

### Tipografía
- Font Family: Plus Jakarta Sans (400, 500, 600, 700)
- Importar: @fontsource/plus-jakarta-sans

### Animaciones
- animate-fade-in: fadeIn 0.5s ease-out
- animate-slide-up: slideUp 0.5s ease-out
- animate-slide-in-right: slideInRight 0.3s ease-out
- animate-scale-in: scaleIn 0.2s ease-out
- animate-pulse-soft: pulseSoft 2s infinite
- animate-bounce-soft: bounceSoft 2s infinite

### Clases utilitarias
- .gradient-hero - fondo hero suave teal
- .gradient-card - fondo card con gradiente sutil
- .gradient-primary - gradiente del color primario
- .shadow-glow - sombra con glow teal


###Schemas
Estructura de Schemas en Supabase
DNSCloud usa schemas separados por módulo para organizar las tablas. Cada módulo tiene su propio schema con tablas sin prefijo.

Schemas definidos:
Schema	Módulo	Descripción
seg	Seguridad	usuarios, empresas, roles, permisos, aplicaciones, rol_permiso, usuario_rol, publicaciones
emp	Empleados	empleados
equ	Equipos	(por implementar)
mov	Movimientos	(por implementar)
par	Partes Diarios	(por implementar)
hab	Habilitaciones	(por implementar)
Patrón de implementación:
Crear schema: CREATE SCHEMA IF NOT EXISTS <prefix>;
Tablas sin prefijo: <schema>.tabla (ej: seg.usuarios, emp.empleados)
Cliente dedicado: Cada módulo tiene su cliente Supabase con db: { schema: '<prefix>' }
Permisos: Otorgar USAGE y ALL a anon, authenticated
RLS: Políticas por empresa usando public.get_current_user_empresa_id()
Ejemplo de cliente por schema:

// src/modules/<modulo>/services/<prefix>Client.ts
import { createClient } from '@supabase/supabase-js';

export const <prefix>Client = createClient(supabaseUrl, supabaseKey, {
  db: { schema: '<prefix>' },
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});
Convención de nombres:
Schema: 3 letras del módulo (seg, emp, equ, mov, par, hab)
Tablas: nombre en español, singular o plural según contexto
Cliente: <prefix>Client (ej: segClient, empClient)
 