# DNSCloud

Plataforma corporativa modular para gestión empresarial con arquitectura multi-tenant y sistema de permisos basado en roles (RBAC).

## 📋 Descripción

DNSCloud es una aplicación web moderna construida con React y TypeScript que proporciona un ecosistema modular para la gestión de diferentes aspectos empresariales. El sistema está diseñado con una arquitectura de monolito modular, donde cada funcionalidad vive en módulos independientes que se integran mediante un contrato estándar.

### Características Principales

- 🏢 **Multi-tenant**: Soporte para múltiples empresas con aislamiento de datos
- 🔐 **RBAC (Role-Based Access Control)**: Sistema de permisos granular por módulo
- 📦 **Arquitectura Modular**: Módulos independientes con contrato estándar
- 🎨 **UI Moderna**: Interfaz construida con shadcn/ui y Tailwind CSS
- 📱 **PWA**: Aplicación web progresiva con soporte offline
- ⚡ **Rendimiento**: Code splitting automático y lazy loading por módulo
- 🔄 **Tiempo Real**: Actualizaciones en vivo mediante Supabase Realtime

## 🏗️ Arquitectura

### Principios de Diseño

1. **Monolito Modular**: Una sola aplicación con máximo reuso de UI, autenticación y seguridad
2. **Módulos Aislados por Contrato**: Cada módulo se integra mediante un `manifest.ts`
3. **Seguridad Global**: RBAC multi-empresa con empresas, usuarios, roles y permisos
4. **Shared Pequeño y Estable**: Lo específico vive dentro del módulo
5. **Iteración por Vertical Slices**: Cada entrega funciona de punta a punta

### Sistema de Seguridad

- **Multi-tenant**: Todo dato y permiso se evalúa dentro de una empresa (`empresa_id`)
- **Usuarios**: Pertenecen a una empresa
- **Roles**: Definidos por empresa
- **Permisos**: Catálogo global por módulo, asignados a roles
- **Autorización**: El usuario accede si tiene los permisos requeridos en su empresa

### Contrato de Módulo

Cada módulo debe exponer en su `manifest.ts`:

- **Identidad**: `moduleId`, `name`, `description`
- **Permisos**: `permissions[]` con formato `<modulo>.<recurso>.<accion>`
- **Rutas**: `routes[]` con `requiredPermissions`
- **Navegación**: `navItems[]` con `requiredPermissions`

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3** - Biblioteca UI
- **TypeScript 5.8** - Tipado estático
- **Vite 5.4** - Build tool y dev server
- **React Router 6.30** - Enrutamiento
- **TanStack Query 5.83** - Gestión de estado del servidor
- **React Hook Form 7.61** - Formularios
- **Zod 3.25** - Validación de esquemas

### UI/UX
- **shadcn/ui** - Componentes UI
- **Radix UI** - Primitivos accesibles
- **Tailwind CSS 3.4** - Estilos utility-first
- **Lucide React** - Iconos
- **next-themes** - Gestión de temas (claro/oscuro)

### Backend
- **Supabase 2.89** - Backend as a Service
  - PostgreSQL - Base de datos
  - Auth - Autenticación
  - Realtime - Actualizaciones en tiempo real
  - Storage - Almacenamiento de archivos

### Herramientas
- **ESLint** - Linter
- **TypeScript ESLint** - Linter TypeScript
- **Vite PWA** - Service Workers y PWA

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Configuración de la aplicación
│   ├── DynamicRoutes.tsx  # Rutas dinámicas desde módulos
│   ├── moduleRegistry.ts  # Registro central de módulos
│   ├── nav.ts             # Generación de navegación
│   └── routes.tsx         # Configuración de rutas
├── components/            # Componentes compartidos
│   ├── layout/           # Componentes de layout
│   ├── modals/           # Modales reutilizables
│   └── ui/               # Componentes UI (shadcn)
├── contexts/             # Contextos de React
│   ├── AuthContext.tsx   # Autenticación
│   ├── PreferenciasContext.tsx
│   └── SidebarContext.tsx
├── core/                 # Funcionalidad core
│   ├── auth/            # Autenticación
│   ├── layout/           # Layout
│   ├── routing/          # RouteGuard
│   ├── security/         # Permisos
│   └── theme/            # Temas
├── hooks/               # Hooks personalizados
├── integrations/        # Integraciones externas
│   └── supabase/        # Cliente Supabase
├── lib/                 # Utilidades
├── modules/             # Módulos de la aplicación
│   ├── security/        # Administración (empresas, usuarios, roles)
│   ├── rrhh/            # Recursos Humanos
│   ├── equipos/         # Gestión de Equipos
│   ├── operacion/       # Operaciones y Movimientos
│   ├── habilitaciones/  # Certificaciones y Habilitaciones
│   ├── conocimiento/   # Gestión del Conocimiento (SGI)
│   └── comercial/       # Gestión Comercial
├── pages/               # Páginas estáticas
└── shared/              # Código compartido entre módulos
    ├── components/
    ├── hooks/
    ├── lib/
    └── types/
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- npm o yarn
- Cuenta de Supabase (para backend)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd hola-hello-there
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear un archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=tu_clave_publica_de_supabase
```

4. **Configurar la base de datos**

Ejecutar las migraciones de Supabase desde el directorio `supabase/migrations/`:

```bash
# Si usas Supabase CLI
supabase db reset

# O importa las migraciones manualmente desde el dashboard de Supabase
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo en puerto 8080

# Build
npm run build            # Build de producción
npm run build:dev        # Build en modo desarrollo

# Calidad de código
npm run lint             # Ejecuta ESLint

# Preview
npm run preview          # Preview del build de producción
```

## 📦 Módulos Disponibles

### 🔐 Administración (Security)
Gestión de empresas, usuarios, roles y permisos del sistema.

**Funcionalidades:**
- ABM de Empresas
- ABM de Usuarios
- ABM de Roles
- Asignación Roles ↔ Usuarios
- Asignación Permisos ↔ Roles
- Catálogo de Módulos/Permisos
- Sistema de Feedbacks

### 👥 Recursos Humanos (RRHH)
Gestión completa de empleados y recursos humanos.

**Funcionalidades:**
- Maestro de Empleados
- Registro de Asistencia
- Gestión de Permisos y Licencias
- Partes Diarios con Novedades
- Horarios de Trabajo

### 🏗️ Equipos
Gestión de equipos, mantenimientos y partes.

**Funcionalidades:**
- Maestro de Equipos
- Tipos, Marcas y Modelos
- Mantenimientos Preventivos y Correctivos
- Partes de Equipos

### 🚛 Operación
Gestión de movimientos, clientes y operaciones.

**Funcionalidades:**
- Wizard de Movimientos (5 pasos)
- Gestión de Clientes
- Partes de Equipos en Operación
- Configuración de Líneas de Servicio
- Unidades de Negocio

### 📜 Habilitaciones
Gestión de certificaciones y vencimientos.

**Funcionalidades:**
- Certificaciones
- Control de Vencimientos
- Alertas de Vencimiento

### 📚 Conocimiento
Sistema de Gestión Integrado (SGI).

**Funcionalidades:**
- Gestión del Conocimiento
- Documentación

### 💼 Comercial
Gestión comercial y ventas.

**Funcionalidades:**
- Presupuestos
- Certificaciones Comerciales
- Seguimientos de Clientes

## 🔧 Desarrollo

### Agregar un Nuevo Módulo

1. **Crear la estructura del módulo**
```bash
src/modules/mi-modulo/
├── manifest.ts          # Contrato del módulo
├── pages/              # Páginas del módulo
├── components/         # Componentes específicos
├── services/           # Servicios y clientes Supabase
├── hooks/             # Hooks personalizados
└── types/             # Tipos TypeScript
```

2. **Definir el manifest**
```typescript
// src/modules/mi-modulo/manifest.ts
import type { ModuleManifest } from '@/shared/types/module';

export const miModuloManifest: ModuleManifest = {
  moduleId: 'mi-modulo',
  name: 'Mi Módulo',
  description: 'Descripción del módulo',
  permissions: [
    { key: 'mi-modulo.read', name: 'Ver', description: 'Permite ver...' },
    { key: 'mi-modulo.write', name: 'Escribir', description: 'Permite escribir...' },
  ],
  routes: [],
  navItems: [
    { 
      label: 'Mi Módulo', 
      path: '/mi-modulo', 
      icon: 'IconName',
      requiredPermissions: ['mi-modulo.read'] 
    },
  ],
};
```

3. **Registrar el módulo**
```typescript
// src/app/moduleRegistry.ts
import { miModuloManifest } from '@/modules/mi-modulo/manifest';

export const moduleRegistry: ModuleManifest[] = [
  // ... otros módulos
  miModuloManifest,
];
```

4. **Crear el schema en Supabase**
```sql
-- supabase/migrations/XXXXXX_mi_modulo.sql
CREATE SCHEMA IF NOT EXISTS mi_modulo;
-- ... tablas y RLS
```

### Convenciones

- **Permisos**: Formato `<modulo>.<recurso>.<accion>` (ej: `equipos.read`, `rrhh.empleados.create`)
- **Rutas**: Usar rutas descriptivas y consistentes
- **Componentes**: Usar PascalCase para nombres de componentes
- **Hooks**: Prefijo `use` para hooks personalizados
- **Servicios**: Agrupar lógica de negocio en servicios

## 🔒 Seguridad

- **Row Level Security (RLS)**: Habilitado en todas las tablas de Supabase
- **Autenticación**: Supabase Auth con JWT
- **Autorización**: Verificación de permisos en cliente y servidor
- **Multi-tenant**: Aislamiento de datos por `empresa_id`

## 📱 PWA

La aplicación está configurada como PWA con:
- Service Workers para cache offline
- Manifest para instalación
- Actualización automática

## 🧪 Testing

> **Nota**: El proyecto actualmente no incluye tests. Se recomienda agregar:
> - Tests unitarios con Vitest
> - Tests de integración
> - Tests E2E con Playwright

## 📚 Documentación Adicional

- [DNSCloud Blueprint](./docs/DNSCloud-Blueprint.md) - Documentación arquitectónica detallada

## 🤝 Contribución

1. Crear una rama desde `main`
2. Realizar los cambios
3. Asegurar que el código pase el linter (`npm run lint`)
4. Crear un Pull Request

## 📄 Licencia

[Especificar licencia si aplica]

## 👥 Equipo

[Información del equipo si aplica]

---

**Desarrollado con ❤️ usando React, TypeScript y Supabase**
