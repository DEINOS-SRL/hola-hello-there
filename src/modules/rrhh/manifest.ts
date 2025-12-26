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
    { key: 'rrhh.partes.read', name: 'Ver Partes Diarios', description: 'Permite ver partes diarios de tareas' },
    { key: 'rrhh.partes.write', name: 'Crear Partes Diarios', description: 'Permite crear y editar partes diarios' },
    { key: 'rrhh.partes.admin', name: 'Administrar Partes', description: 'Permite gestionar todos los partes y novedades' },
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
        { label: 'Partes Diarios', path: '/rrhh/partes-diarios', icon: 'ClipboardList', requiredPermissions: ['rrhh.partes.read'] },
      ]
    },
  ],
};
