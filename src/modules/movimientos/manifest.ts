import type { ModuleManifest } from '@/shared/types/module';

export const movimientosManifest: ModuleManifest = {
  moduleId: 'movimientos',
  name: 'Movimientos',
  description: 'Gestión de movimientos y operaciones',
  permissions: [
    { key: 'movimientos.read', name: 'Ver movimientos', description: 'Permite ver la lista de movimientos' },
    { key: 'movimientos.create', name: 'Crear movimientos', description: 'Permite crear nuevos movimientos' },
    { key: 'movimientos.update', name: 'Editar movimientos', description: 'Permite editar movimientos existentes' },
    { key: 'movimientos.delete', name: 'Eliminar movimientos', description: 'Permite eliminar movimientos' },
    { key: 'movimientos.approve', name: 'Aprobar movimientos', description: 'Permite aprobar movimientos' },
  ],
  routes: [],
  navItems: [
    { label: 'Movimientos', path: '/movimientos', icon: 'ArrowLeftRight', requiredPermissions: ['movimientos.read'] },
  ],
};
