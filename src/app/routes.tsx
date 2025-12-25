// Configuración central de rutas basada en módulos
// Este archivo sirve como referencia, las rutas se definen en App.tsx

import { moduleRegistry } from './moduleRegistry';

// Obtener todas las rutas de todos los módulos
export function getAllModuleRoutes() {
  return moduleRegistry.flatMap(module => 
    module.routes.map(route => ({
      ...route,
      moduleId: module.moduleId,
    }))
  );
}

// Verificar si una ruta requiere permisos específicos
export function getRoutePermissions(path: string): string[] {
  for (const module of moduleRegistry) {
    const route = module.routes.find(r => r.path === path);
    if (route) {
      return route.requiredPermissions || [];
    }
  }
  return [];
}
