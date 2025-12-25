import type { ModuleManifest } from '@/shared/types/module';

export const habilitacionesManifest: ModuleManifest = {
  moduleId: 'habilitaciones',
  name: 'Habilitaciones',
  description: 'Gestión de habilitaciones y certificaciones',
  permissions: [
    { key: 'habilitaciones.read', name: 'Ver habilitaciones', description: 'Permite ver la lista de habilitaciones' },
    { key: 'habilitaciones.create', name: 'Crear habilitaciones', description: 'Permite crear nuevas habilitaciones' },
    { key: 'habilitaciones.update', name: 'Editar habilitaciones', description: 'Permite editar habilitaciones existentes' },
    { key: 'habilitaciones.delete', name: 'Eliminar habilitaciones', description: 'Permite eliminar habilitaciones' },
  ],
  routes: [],
  navItems: [
    { label: 'Habilitaciones', path: '/habilitaciones', icon: 'BadgeCheck', requiredPermissions: ['habilitaciones.read'] },
  ],
};
