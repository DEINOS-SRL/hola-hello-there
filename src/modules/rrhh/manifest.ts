import type { ModuleManifest } from '@/shared/types/module';

export const rrhhManifest: ModuleManifest = {
  moduleId: 'rrhh',
  name: 'RRHH',
  description: 'Gestión de Recursos Humanos',
  permissions: [
    { key: 'rrhh.read', name: 'Ver RRHH', description: 'Permite acceder al módulo de RRHH' },
    { key: 'rrhh.admin', name: 'Administrar RRHH', description: 'Permite administrar configuraciones de RRHH' },
    { key: 'rrhh.asistencia.read', name: 'Ver Asistencia', description: 'Permite ver registros de asistencia' },
    { key: 'rrhh.asistencia.admin', name: 'Administrar Asistencia', description: 'Permite administrar asistencia y permisos' },
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
        { label: 'Asistencia', path: '/rrhh/asistencia', icon: 'Clock', requiredPermissions: ['rrhh.asistencia.read'] },
      ]
    },
  ],
};
