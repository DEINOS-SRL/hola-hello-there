import type { ModuleManifest } from '@/shared/types/module';

export const securityManifest: ModuleManifest = {
  moduleId: 'administracion',
  name: 'Administración',
  description: 'Gestión de empresas, usuarios, roles y permisos',
  permissions: [
    { key: 'security.empresas.read', name: 'Ver empresas', description: 'Permite ver la lista de empresas' },
    { key: 'security.empresas.create', name: 'Crear empresas', description: 'Permite crear nuevas empresas' },
    { key: 'security.empresas.update', name: 'Editar empresas', description: 'Permite editar empresas existentes' },
    { key: 'security.empresas.delete', name: 'Eliminar empresas', description: 'Permite eliminar empresas' },
    { key: 'security.usuarios.read', name: 'Ver usuarios', description: 'Permite ver la lista de usuarios' },
    { key: 'security.usuarios.create', name: 'Crear usuarios', description: 'Permite crear nuevos usuarios' },
    { key: 'security.usuarios.update', name: 'Editar usuarios', description: 'Permite editar usuarios existentes' },
    { key: 'security.usuarios.delete', name: 'Eliminar usuarios', description: 'Permite eliminar usuarios' },
    { key: 'security.roles.read', name: 'Ver roles', description: 'Permite ver la lista de roles' },
    { key: 'security.roles.create', name: 'Crear roles', description: 'Permite crear nuevos roles' },
    { key: 'security.roles.update', name: 'Editar roles', description: 'Permite editar roles existentes' },
    { key: 'security.roles.delete', name: 'Eliminar roles', description: 'Permite eliminar roles' },
    { key: 'security.permisos.assign', name: 'Asignar permisos', description: 'Permite asignar permisos a roles' },
    { key: 'security.modulos.read', name: 'Ver módulos', description: 'Permite ver la lista de módulos' },
    { key: 'security.modulos.manage', name: 'Gestionar módulos', description: 'Permite gestionar módulos' },
  ],
  routes: [],
  navItems: [
    { label: 'Empresas', path: '/configuracion/administracion/empresas', icon: 'Building2', requiredPermissions: ['security.empresas.read'] },
    { label: 'Usuarios', path: '/configuracion/administracion/usuarios', icon: 'Users', requiredPermissions: ['security.usuarios.read'] },
    { label: 'Roles', path: '/configuracion/administracion/roles', icon: 'Shield', requiredPermissions: ['security.roles.read'] },
    { label: 'Módulos', path: '/configuracion/administracion/modulos', icon: 'LayoutGrid', requiredPermissions: ['security.modulos.read'] },
  ],
};
