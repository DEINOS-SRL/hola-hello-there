Actuá como Ingeniero en Sistemas Senior diseñando e implementando el módulo de Seguridad y Administración para un SaaS multi-tenant (plataforma corporativa para empresas de servicios) con React + Supabase (Postgres, Auth, RLS, RPC).

OBJETIVO FUNCIONAL
1) Multi-tenant por Empresa (tenant).
2) Catálogo global de navegación: Sección -> Módulo -> Funcionalidad.
3) Seguridad basada en RBAC con “rol por ámbito”: el ámbito (scope) principal es la SECCIÓN.
   - Ejemplo: un usuario puede ser “Supervisor” en Operación y “Usuario común” en RRHH.
4) Feature flags por Empresa: una Empresa habilita/deshabilita funcionalidades del catálogo.
5) Permiso efectivo para ejecutar una funcionalidad:
   - El usuario debe ser miembro de la empresa
   - La funcionalidad debe estar habilitada para la empresa (empresa_funcionalidades.enabled = true)
   - El usuario debe tener algún rol asignado en la SECCIÓN de esa funcionalidad
   - Ese rol debe permitir esa funcionalidad (rol_permisos.allow = true) y opcionalmente la acción (read/create/update/delete/approve)
6) El Front debe renderizar menú/botones según permisos, y la base de datos debe ENFORCEARLO con RLS (no confiar en el front).

PREGUNTA DE ARQUITECTURA (resolver en el diseño)
- “¿Cada módulo debería exponer su funcionalidad?” -> Sí:
  - Cada Módulo define sus Funcionalidades de forma declarativa (código/catálogo).
  - Las Funcionalidades son el contrato de seguridad: todo endpoint/acción relevante debe mapear a una funcionalidad (o acción dentro de funcionalidad).
  - El catálogo se mantiene centralizado, pero cada módulo “registra” (seed/migration) sus funcionalidades para evitar que queden sueltas.

MODELO DE DATOS (crear migraciones SQL)
A) Tenant / usuarios
- empresas(id uuid pk, nombre text, estado text, created_at timestamptz)
- perfiles_usuarios(user_id uuid pk references auth.users(id), nombre text, email text, created_at)
- empresa_usuarios(id uuid pk, empresa_id uuid fk, user_id uuid fk, estado text, created_at,
  unique(empresa_id, user_id))

B) Catálogo global (producto)
- secciones(id uuid pk, codigo text unique, nombre text, orden int)
- modulos(id uuid pk, seccion_id uuid fk, codigo text unique, nombre text, orden int)
- funcionalidades(id uuid pk, modulo_id uuid fk, codigo text unique, nombre text, descripcion text,
  acciones jsonb default '["read","create","update","delete"]', orden int)

C) Seguridad scoped a Sección
- roles(id uuid pk, empresa_id uuid fk, seccion_id uuid fk, nombre text, descripcion text, created_at,
  unique(empresa_id, seccion_id, nombre))
- usuario_roles(id uuid pk, empresa_id uuid fk, user_id uuid fk, seccion_id uuid fk, rol_id uuid fk,
  unique(empresa_id, user_id, seccion_id, rol_id))

D) Permisos / features por empresa
- rol_permisos(id uuid pk, rol_id uuid fk, funcionalidad_id uuid fk, allow bool,
  acciones jsonb nullable (ej: {"read":true,"create":false,"approve":true}),
  unique(rol_id, funcionalidad_id))
- empresa_funcionalidades(id uuid pk, empresa_id uuid fk, funcionalidad_id uuid fk, enabled bool default true,
  unique(empresa_id, funcionalidad_id))

E) Auditoría
- audit_log(id uuid pk, empresa_id uuid, actor_user_id uuid, tipo text, entidad text, entidad_id uuid,
  detalle jsonb, created_at timestamptz default now())

REGLAS DE NEGOCIO (importantes)
- Un usuario SIN rol asignado en una sección NO ve esa sección ni sus módulos.
- Un rol pertenece a (empresa + sección). No existe rol “global” a toda la empresa salvo que se decida explícitamente.
- Una funcionalidad pertenece a un módulo y por herencia a una sección (funcionalidad -> módulo -> sección).
- Los permisos se otorgan por funcionalidad (y opcional por acción).

FUNCIONES SQL / RPC (crear)
1) rpc_get_my_menu(empresa_id uuid) -> devuelve árbol Sección->Módulo->Funcionalidad permitidas para el usuario actual.
   - Solo incluir funcionalidades con empresa_funcionalidades.enabled=true y allow=true vía roles en esa sección.
2) rpc_can(empresa_id uuid, funcionalidad_codigo text, accion text default 'read') -> boolean
3) rpc_assign_role(empresa_id, target_user_id, seccion_codigo, rol_id) (solo si tiene permiso security.manage)
4) rpc_set_role_permission(rol_id, funcionalidad_id, allow, acciones_jsonb)
5) rpc_set_company_feature(empresa_id, funcionalidad_id, enabled)
6) rpc_audit_insert(...) helper si hace falta.

RLS (Row Level Security) - implementar políticas
- empresa_usuarios: select solo el propio usuario + admins; insert/update solo admins (security.manage)
- roles / usuario_roles / rol_permisos / empresa_funcionalidades: CRUD SOLO si el actor tiene security.manage en la sección “Administración” o un mecanismo de “admin general”.
- Tablas de cada módulo (ej: rrhh_empleados, rrhh_asistencias, etc.) deben filtrar por empresa_id y además exigir permiso por funcionalidad/acción mediante rpc_can().
- audit_log: insert para miembros (o vía RPC), select solo admins.

FRONTEND (React) - implementar
- Tenant selector (empresa actual).
- PermissionProvider:
  - carga rpc_get_my_menu al iniciar o cambiar empresa
  - helper can(codigo, accion) basado en cache del backend
- Admin UI “Administración > Seguridad”
  Tabs:
  1) Miembros (empresa_usuarios) + asignación de roles por sección
  2) Roles por sección (ABM)
  3) Permisos por rol (matriz toggles)
  4) Features por empresa (habilitar funcionalidades)
  5) Auditoría

SEMILLA INICIAL (seed/catalog)
Crear Secciones y Módulos/Funcionalidades iniciales:

SECCIÓN: RRHH (codigo: rrhh)
- MÓDULO: Empleados (codigo: rrhh.empleados)
  Funcionalidades:
  - rrhh.empleados.ver (read)
  - rrhh.empleados.crear (create)
  - rrhh.empleados.editar (update)
  - rrhh.empleados.baja (delete)
- MÓDULO: Asistencia (codigo: rrhh.asistencia)
  Funcionalidades:
  - rrhh.asistencia.ver
  - rrhh.asistencia.registrar
  - rrhh.asistencia.editar
  - rrhh.asistencia.aprobar (approve)
- MÓDULO: Parte Diario de Tareas (codigo: rrhh.partes_diarios)
  Funcionalidades:
  - rrhh.partes_diarios.ver
  - rrhh.partes_diarios.cargar
  - rrhh.partes_diarios.revisar (approve)
  - rrhh.partes_diarios.cerrar (approve)

SECCIÓN: Operación (codigo: operacion)
- MÓDULO: Movimientos (codigo: operacion.movimientos)
  Funcionalidades:
  - operacion.movimientos.ver
  - operacion.movimientos.generar
  - operacion.movimientos.asignar_equipo
  - operacion.movimientos.asignar_empleado
- MÓDULO: Diagramas (codigo: operacion.diagramas)
  Funcionalidades:
  - operacion.diagramas.ver
  - operacion.diagramas.crear
  - operacion.diagramas.editar
  - operacion.diagramas.publicar (approve)
- MÓDULO: Carga de Combustible (codigo: operacion.combustible)
  Funcionalidades:
  - operacion.combustible.ver
  - operacion.combustible.solicitar
  - operacion.combustible.aprobar (approve)
  - operacion.combustible.cerrar (approve)

ROLES BASE POR SECCIÓN (por empresa)
- RRHH: Administrador RRHH, Supervisor RRHH, Usuario RRHH, Visor RRHH
- Operación: Administrador Operación, Supervisor Operación, Operario Operación, Visor Operación

Permisos default sugeridos:
- Administrador *: allow a todo en su sección
- Supervisor: allow a ver + aprobar lo que aplique + editar
- Operario/Usuario: allow a ver + cargar/registrar (sin aprobar)
- Visor: solo ver

ENTREGABLES
1) Migraciones SQL completas (tablas + seeds)
2) RLS policies completas y seguras
3) RPCs implementadas
4) Front React: provider + pantallas admin + ejemplo de uso de can()
5) README con pasos de instalación y pruebas (casos: mismo usuario con roles distintos por sección)

IMPORTANTE
- No confiar en el front: todo enforcement debe estar en RLS/RPC.
- Evitar duplicación: el “catálogo” es único y los módulos “registran” sus funcionalidades vía seed.
- Documentar bien cómo agregar un nuevo módulo y sus funcionalidades.