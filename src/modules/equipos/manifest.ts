import type { ModuleManifest } from '@/shared/types/module';

export const equiposManifest: ModuleManifest = {
  moduleId: 'equipos',
  name: 'Equipos',
  description: 'Gestión de equipos y maquinaria',
  permissions: [
    { key: 'equipos.read', name: 'Ver equipos', description: 'Permite ver la lista de equipos' },
    { key: 'equipos.create', name: 'Crear equipos', description: 'Permite crear nuevos equipos' },
    { key: 'equipos.update', name: 'Editar equipos', description: 'Permite editar equipos existentes' },
    { key: 'equipos.delete', name: 'Eliminar equipos', description: 'Permite eliminar equipos' },
  ],
  routes: [],
  navItems: [
    { label: 'Equipos', path: '/equipos', icon: 'Truck', requiredPermissions: ['equipos.read'] },
  ],
};
