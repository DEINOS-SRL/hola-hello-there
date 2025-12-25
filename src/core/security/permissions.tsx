import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '@/core/auth';

interface PermissionsContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { user } = useAuth();

  // TODO: Cargar permisos desde seg_rol_permiso basado en los roles del usuario
  const permissions = useMemo(() => {
    // Por ahora retornamos array vacío, se implementará la carga desde DB
    return [] as string[];
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every(p => permissions.includes(p));
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, hasAnyPermission, hasAllPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}
