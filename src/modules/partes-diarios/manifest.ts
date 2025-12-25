import type { ModuleManifest } from '@/shared/types/module';

export const partesDiariosManifest: ModuleManifest = {
  moduleId: 'partes-diarios',
  name: 'Partes Diarios',
  description: 'Gestión de partes diarios de trabajo',
  permissions: [
    { key: 'partes-diarios.read', name: 'Ver partes', description: 'Permite ver la lista de partes diarios' },
    { key: 'partes-diarios.create', name: 'Crear partes', description: 'Permite crear nuevos partes diarios' },
    { key: 'partes-diarios.update', name: 'Editar partes', description: 'Permite editar partes diarios existentes' },
    { key: 'partes-diarios.delete', name: 'Eliminar partes', description: 'Permite eliminar partes diarios' },
    { key: 'partes-diarios.approve', name: 'Aprobar partes', description: 'Permite aprobar partes diarios' },
  ],
  routes: [],
  navItems: [
    { label: 'Partes Diarios', path: '/partes-diarios', icon: 'ClipboardList', requiredPermissions: ['partes-diarios.read'] },
  ],
};
