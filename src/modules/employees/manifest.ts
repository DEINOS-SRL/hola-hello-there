import type { ModuleManifest } from '@/shared/types/module';

export const employeesManifest: ModuleManifest = {
  moduleId: 'employees',
  name: 'Empleados',
  description: 'Gestión de empleados de la empresa',
  permissions: [
    { key: 'employees.read', name: 'Ver empleados', description: 'Permite ver la lista de empleados' },
    { key: 'employees.create', name: 'Crear empleados', description: 'Permite crear nuevos empleados' },
    { key: 'employees.update', name: 'Editar empleados', description: 'Permite editar empleados existentes' },
    { key: 'employees.delete', name: 'Eliminar empleados', description: 'Permite eliminar empleados' },
  ],
  routes: [],
  navItems: [
    { label: 'Empleados', path: '/empleados', icon: 'Users', requiredPermissions: ['employees.read'] },
  ],
};
