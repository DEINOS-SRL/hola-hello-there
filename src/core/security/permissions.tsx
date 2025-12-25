import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/core/auth';
import { segClient } from '@/modules/security/services/segClient';

interface PermissionsContextType {
  permissions: string[];
  isLoadingPermissions: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  const loadPermissions = async () => {
    if (!user?.id) {
      setPermissions([]);
      setIsLoadingPermissions(false);
      return;
    }

    // Si es admin, darle todos los permisos (superuser)
    if (isAdmin) {
      // Cargar todos los permisos disponibles
      const { data: allPermisos } = await segClient
        .from('permisos')
        .select('nombre');
      
      if (allPermisos) {
        setPermissions(allPermisos.map((p: any) => p.nombre));
      }
      setIsLoadingPermissions(false);
      return;
    }

    try {
      // Obtener roles del usuario
      const { data: userRoles, error: rolesError } = await segClient
        .from('usuario_rol')
        .select('rol_id')
        .eq('usuario_id', user.id);

      if (rolesError || !userRoles?.length) {
        setPermissions([]);
        setIsLoadingPermissions(false);
        return;
      }

      const rolIds = userRoles.map((r: any) => r.rol_id);

      // Obtener permisos de esos roles
      const { data: rolePermisos, error: permisosError } = await segClient
        .from('rol_permiso')
        .select('permiso_id, permisos(nombre)')
        .in('rol_id', rolIds);

      if (permisosError || !rolePermisos) {
        setPermissions([]);
        setIsLoadingPermissions(false);
        return;
      }

      // Extraer nombres únicos de permisos
      const permissionNames = [...new Set(
        rolePermisos
          .map((rp: any) => rp.permisos?.nombre)
          .filter(Boolean)
      )];

      setPermissions(permissionNames);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [user?.id, isAdmin]);

  const hasPermission = (permission: string): boolean => {
    if (isAdmin) return true; // Admin tiene acceso total
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (isAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    if (isAdmin) return true;
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every(p => permissions.includes(p));
  };

  const refreshPermissions = async () => {
    setIsLoadingPermissions(true);
    await loadPermissions();
  };

  return (
    <PermissionsContext.Provider value={{ 
      permissions, 
      isLoadingPermissions,
      hasPermission, 
      hasAnyPermission, 
      hasAllPermissions,
      refreshPermissions
    }}>
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
