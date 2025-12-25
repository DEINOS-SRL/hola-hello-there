import { moduleRegistry } from './moduleRegistry';
import type { ModuleNavItem } from '@/shared/types/module';

export interface NavSection {
  moduleId: string;
  moduleName: string;
  items: ModuleNavItem[];
}

// Obtener navegación filtrada por permisos del usuario
export function getNavigationForUser(userPermissions: string[]): NavSection[] {
  return moduleRegistry
    .map(module => ({
      moduleId: module.moduleId,
      moduleName: module.name,
      items: module.navItems.filter(item => {
        // Si no requiere permisos, mostrar siempre
        if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
          return true;
        }
        // Verificar si el usuario tiene al menos uno de los permisos requeridos
        return item.requiredPermissions.some(p => userPermissions.includes(p));
      }),
    }))
    .filter(section => section.items.length > 0);
}

// Obtener todos los items de navegación (para admin)
export function getAllNavigationItems(): NavSection[] {
  return moduleRegistry.map(module => ({
    moduleId: module.moduleId,
    moduleName: module.name,
    items: module.navItems,
  }));
}
