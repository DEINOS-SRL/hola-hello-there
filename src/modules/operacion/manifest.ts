import type { ModuleManifest } from '@/shared/types/module';

export const operacionManifest: ModuleManifest = {
  moduleId: 'operacion',
  name: 'Operación',
  description: 'Gestión de operaciones, movimientos y actividades',
  permissions: [
    // Permisos de Movimientos (submódulo)
    { key: 'movimientos.read', name: 'Ver movimientos', description: 'Permite ver la lista de movimientos' },
    { key: 'movimientos.create', name: 'Crear movimientos', description: 'Permite crear nuevos movimientos' },
    { key: 'movimientos.update', name: 'Editar movimientos', description: 'Permite editar movimientos existentes' },
    { key: 'movimientos.delete', name: 'Eliminar movimientos', description: 'Permite eliminar movimientos' },
    { key: 'movimientos.approve', name: 'Aprobar movimientos', description: 'Permite aprobar movimientos' },
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
      ],
    },
  ],
};
