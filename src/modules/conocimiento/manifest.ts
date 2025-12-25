import type { ModuleManifest } from '@/shared/types/module';

export const conocimientoManifest: ModuleManifest = {
  moduleId: 'conocimiento',
  name: 'Base de Conocimiento',
  description: 'Gestión del conocimiento corporativo y SGI',
  permissions: [
    { key: 'conocimiento.read', name: 'Ver conocimiento', description: 'Ver documentos y artículos' },
    { key: 'conocimiento.write', name: 'Editar conocimiento', description: 'Crear y editar documentos' },
    { key: 'conocimiento.delete', name: 'Eliminar conocimiento', description: 'Eliminar documentos' },
    { key: 'conocimiento.sgi.read', name: 'Ver SGI', description: 'Ver documentos del Sistema de Gestión Integrada' },
    { key: 'conocimiento.sgi.write', name: 'Editar SGI', description: 'Gestionar documentos SGI' },
  ],
  routes: [],
  navItems: [
    { label: 'Base de Conocimiento', path: '/conocimiento', icon: 'BookOpen', requiredPermissions: ['conocimiento.read'] },
    { label: 'SGI', path: '/conocimiento/sgi', icon: 'FileCheck', requiredPermissions: ['conocimiento.sgi.read'] },
  ],
};
