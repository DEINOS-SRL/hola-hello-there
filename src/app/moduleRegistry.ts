import type { ModuleManifest } from '@/shared/types/module';

// Import de manifests de módulos
import { securityManifest } from '@/modules/security/manifest';
import { rrhhManifest } from '@/modules/rrhh/manifest';
import { equiposManifest } from '@/modules/equipos/manifest';
import { operacionManifest } from '@/modules/operacion/manifest';
import { partesDiariosManifest } from '@/modules/partes-diarios/manifest';
import { habilitacionesManifest } from '@/modules/habilitaciones/manifest';
import { conocimientoManifest } from '@/modules/conocimiento/manifest';


// Registro central de todos los módulos
export const moduleRegistry: ModuleManifest[] = [
  securityManifest,
  rrhhManifest,
  equiposManifest,
  operacionManifest,
  partesDiariosManifest,
  habilitacionesManifest,
  conocimientoManifest,
];

// Helpers para acceder a los módulos
export function getModuleById(moduleId: string): ModuleManifest | undefined {
  return moduleRegistry.find(m => m.moduleId === moduleId);
}

export function getAllPermissions(): { moduleId: string; moduleName: string; permissions: ModuleManifest['permissions'] }[] {
  return moduleRegistry.map(m => ({
    moduleId: m.moduleId,
    moduleName: m.name,
    permissions: m.permissions,
  }));
}

export function getAllNavItems(): { moduleId: string; navItems: ModuleManifest['navItems'] }[] {
  return moduleRegistry.map(m => ({
    moduleId: m.moduleId,
    navItems: m.navItems,
  }));
}
