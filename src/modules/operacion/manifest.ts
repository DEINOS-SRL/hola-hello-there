import type { ModuleManifest } from '@/shared/types/module';

export const operacionManifest: ModuleManifest = {
  moduleId: 'operacion',
  name: 'Operación',
  description: 'Gestión de operaciones, movimientos, partes de equipos y actividades',
  permissions: [
    // Permisos de Movimientos
    { key: 'movimientos.read', name: 'Ver movimientos', description: 'Permite ver la lista de movimientos' },
    { key: 'movimientos.create', name: 'Crear movimientos', description: 'Permite crear nuevos movimientos' },
    { key: 'movimientos.update', name: 'Editar movimientos', description: 'Permite editar movimientos existentes' },
    { key: 'movimientos.delete', name: 'Eliminar movimientos', description: 'Permite eliminar movimientos' },
    { key: 'movimientos.approve', name: 'Aprobar movimientos', description: 'Permite aprobar movimientos' },
    // Permisos de Partes de Equipos
    { key: 'partes-equipos.read', name: 'Ver partes de equipos', description: 'Permite ver la lista de partes de equipos' },
    { key: 'partes-equipos.create', name: 'Crear partes de equipos', description: 'Permite crear nuevos partes de equipos' },
    { key: 'partes-equipos.update', name: 'Editar partes de equipos', description: 'Permite editar partes de equipos existentes' },
    { key: 'partes-equipos.delete', name: 'Eliminar partes de equipos', description: 'Permite eliminar partes de equipos' },
    { key: 'partes-equipos.approve', name: 'Aprobar partes de equipos', description: 'Permite aprobar partes de equipos' },
    // Permisos de Clientes
    { key: 'clientes.read', name: 'Ver clientes', description: 'Permite ver clientes de operación' },
    { key: 'clientes.create', name: 'Crear clientes', description: 'Permite crear clientes' },
    { key: 'clientes.update', name: 'Editar clientes', description: 'Permite editar clientes' },
    { key: 'clientes.delete', name: 'Eliminar clientes', description: 'Permite eliminar clientes' },
    // Permisos de Configuración
    { key: 'configuracion-lineas.read', name: 'Ver configuración de líneas', description: 'Ver unidades, tipos y subtipos' },
    { key: 'configuracion-lineas.manage', name: 'Gestionar líneas de servicio', description: 'ABM de unidades, tipos y subtipos' },
  ],
  routes: [],
  navItems: [
    { 
      label: 'Operación', 
      path: '/operacion', 
      icon: 'Workflow', 
      requiredPermissions: ['movimientos.read'],
      children: [
        { 
          label: 'Movimientos', 
          path: '/operacion/movimientos', 
          icon: 'ArrowLeftRight', 
          requiredPermissions: ['movimientos.read'] 
        },
        { 
          label: 'Partes de Equipos', 
          path: '/operacion/partes-equipos', 
          icon: 'ClipboardList', 
          requiredPermissions: ['partes-equipos.read'] 
        },
        { 
          label: 'Clientes', 
          path: '/operacion/clientes', 
          icon: 'Building2', 
          requiredPermissions: ['clientes.read'] 
        },
        { 
          label: 'Líneas de Servicio', 
          path: '/operacion/configuracion-lineas', 
          icon: 'Settings2', 
          requiredPermissions: ['configuracion-lineas.read'] 
        },
      ],
    },
  ],
};
