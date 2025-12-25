import type { ModuleManifest } from '@/shared/types/module';

export const rrhhManifest: ModuleManifest = {
  moduleId: 'rrhh',
  name: 'RRHH',
  description: 'Gestión de Recursos Humanos',
  permissions: [
    { key: 'rrhh.read', name: 'Ver RRHH', description: 'Permite acceder al módulo de RRHH' },
    { key: 'rrhh.admin', name: 'Administrar RRHH', description: 'Permite administrar configuraciones de RRHH' },
  ],
  routes: [],
  navItems: [
    { 
      label: 'RRHH', 
      path: '/rrhh', 
      icon: 'Users', 
      requiredPermissions: ['rrhh.read'],
      children: [
        { label: 'Empleados', path: '/rrhh/empleados', icon: 'UserCheck', requiredPermissions: ['rrhh.read'] },
      ]
    },
  ],
};
