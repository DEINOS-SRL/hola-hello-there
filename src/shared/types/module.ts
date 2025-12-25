// Tipos base para el sistema modular de DNSCloud

export interface ModulePermission {
  key: string;
  name: string;
  description?: string;
}

export interface ModuleRoute {
  path: string;
  element: React.ReactNode;
  requiredPermissions?: string[];
}

export interface ModuleNavItem {
  label: string;
  path: string;
  icon?: string;
  requiredPermissions?: string[];
  children?: ModuleNavItem[];
}

export interface ModuleManifest {
  moduleId: string;
  name: string;
  description?: string;
  permissions: ModulePermission[];
  routes: ModuleRoute[];
  navItems: ModuleNavItem[];
}
