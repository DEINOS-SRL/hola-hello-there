# DNSCloud — Blueprint (Repo)

**Ruta:** `docs/DNSCloud-Blueprint.md`  

**Nota:** El Custom Knowledge del proyecto Lovable referencia este archivo. Si hay diferencias, **Custom Knowledge manda**.

---

## 1. Visión del producto

DNSCloud es una plataforma corporativa modular. El acceso es centralizado por un **Shell** y cada funcionalidad vive en **módulos** independientes dentro del mismo repositorio.

Módulos iniciales:

- Seguridad

- Empleados

- Equipos

- Movimientos

- Partes diarios

- Habilitaciones  

Luego se sumarán nuevos módulos.

---

## 2. Principios de arquitectura

1. **Monolito modular (una sola app):** máximo reuso de UI, auth y seguridad.

2. **Módulos aislados por contrato:** cada módulo se integra mediante un `manifest.ts`.

3. **Seguridad global (RBAC multi-empresa):** empresas, usuarios, roles, permisos.

4. **Shared pequeño y estable:** lo específico vive dentro del módulo.

5. **Iteración por vertical slices:** cada entrega funciona de punta a punta.

---

## 3. Seguridad global (RBAC multi-empresa)

### 3.1 Conceptos

- **empresaId**: tenant. Todo dato y permiso se evalúa dentro de una empresa.

- **Usuario**: pertenece a una empresa.

- **Roles**: por empresa.

- **Permisos**: catálogo global por módulo (keys), asignados a roles.

- **Autorización**: el usuario accede si tiene los permisos requeridos en su empresa.

### 3.2 Capacidades del módulo Seguridad (MVP)

- ABM Empresas

- ABM Usuarios

- ABM Roles

- Asignación Roles ↔ Usuarios

- Asignación Permisos ↔ Roles

- Catálogo de módulos/permisos (sync desde manifests)

---

## 4. Contrato de módulo (manifest.ts)

Cada módulo debe exponer:

- Identidad: `moduleId`, `name`

- Permisos: `permissions[]`

- Rutas: `routes[]` con `requiredPermissions`

- Navegación: `navItems[]` con `requiredPermissions`

Convención de permisos:

- `<modulo>.<accion>` o `<modulo>.<recurso>.<accion>`

- Ej: `equipos.read`, `employees.create`, `movimientos.approve`

---

## 5. Estructura del repositorio (obligatoria)

Recomendación estándar:

```txt
src/
  app/
    moduleRegistry.ts
    routes.tsx
    nav.ts
  core/
    auth/
    routing/
      RouteGuard.tsx
    security/
      permissions.tsx
    layout/
    theme/
  shared/
    types/
    components/
    hooks/
    lib/
  modules/
    security/
      manifest.ts
      pages/
      components/
      services/
    employees/
      manifest.ts
      pages/
      components/
      services/
    equipos/
      manifest.ts
      pages/
      components/
      services/
    movimientos/
      manifest.ts
      pages/
      components/
      services/
    partes-diarios/
      manifest.ts
      pages/
      components/
      services/
    habilitaciones/
      manifest.ts
      pages/
      components/
      services/
docs/
  DNSCloud-Blueprint.md
```
