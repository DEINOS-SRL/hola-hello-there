import type { ModuleManifest } from '@/shared/types/module';

export const comercialManifest: ModuleManifest = {
  moduleId: 'comercial',
  name: 'Comercial',
  description: 'Gestión comercial: presupuestos, certificaciones y seguimientos',
  permissions: [
    { key: 'comercial.read', name: 'Ver sección comercial', description: 'Permite ver el módulo comercial' },
    { key: 'comercial.write', name: 'Editar comercial', description: 'Permite editar datos comerciales' },
    { key: 'presupuestos.read', name: 'Ver presupuestos', description: 'Permite ver presupuestos' },
    { key: 'presupuestos.write', name: 'Editar presupuestos', description: 'Permite crear y editar presupuestos' },
    { key: 'presupuestos.delete', name: 'Eliminar presupuestos', description: 'Permite eliminar presupuestos' },
    { key: 'certificaciones_com.read', name: 'Ver certificaciones', description: 'Permite ver certificaciones comerciales' },
    { key: 'certificaciones_com.write', name: 'Editar certificaciones', description: 'Permite editar certificaciones' },
    { key: 'certificaciones_com.delete', name: 'Eliminar certificaciones', description: 'Permite eliminar certificaciones' },
    { key: 'seguimientos.read', name: 'Ver seguimientos', description: 'Permite ver seguimientos' },
    { key: 'seguimientos.write', name: 'Editar seguimientos', description: 'Permite editar seguimientos' },
    { key: 'seguimientos.delete', name: 'Eliminar seguimientos', description: 'Permite eliminar seguimientos' },
  ],
  routes: [],
  navItems: [
    { label: 'Comercial', path: '/comercial', icon: 'Briefcase', requiredPermissions: ['comercial.read'] },
    { label: 'Presupuestos', path: '/comercial/presupuestos', icon: 'FileSpreadsheet', requiredPermissions: ['presupuestos.read'] },
    { label: 'Certificaciones', path: '/comercial/certificaciones', icon: 'FileCheck2', requiredPermissions: ['certificaciones_com.read'] },
    { label: 'Seguimientos', path: '/comercial/seguimientos', icon: 'Activity', requiredPermissions: ['seguimientos.read'] },
  ],
};
