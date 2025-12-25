import type { ModuleManifest } from '@/shared/types/module';

export const conocimientoManifest: ModuleManifest = {
  moduleId: 'conocimiento',
  name: 'Base de Conocimiento',
  description: 'Gestión de documentación y conocimiento organizacional',
  permissions: [
    { key: 'conocimiento.read', name: 'Ver Base de Conocimiento', description: 'Permite acceder al módulo de conocimiento' },
    { key: 'conocimiento.write', name: 'Editar Conocimiento', description: 'Permite crear y editar documentos' },
    { key: 'conocimiento.admin', name: 'Administrar Conocimiento', description: 'Permite administrar configuraciones del módulo' },
    { key: 'conocimiento.sgi.read', name: 'Ver SGI', description: 'Permite acceder al Sistema de Gestión Integrado' },
    { key: 'conocimiento.sgi.write', name: 'Editar SGI', description: 'Permite crear y editar documentos SGI' },
  ],
  routes: [],
  navItems: [
    { 
      label: 'Conocimiento', 
      path: '/conocimiento', 
      icon: 'BookOpen', 
      requiredPermissions: ['conocimiento.read'],
      children: [
        { label: 'SGI', path: '/conocimiento/sgi', icon: 'FileCheck', requiredPermissions: ['conocimiento.sgi.read'] },
      ]
    },
  ],
};
