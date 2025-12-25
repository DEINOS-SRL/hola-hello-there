import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/core/auth';
import { usePermissions } from '@/core/security/permissions';

interface RouteGuardProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

export function RouteGuard({ 
  children, 
  requiredPermissions = [], 
  requireAuth = true,
  fallbackPath = '/login'
}: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const { hasAllPermissions } = usePermissions();
  const location = useLocation();

  // Mostrar loading mientras se verifica auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar autenticación
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Verificar permisos
  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">Acceso Denegado</h1>
        <p className="text-muted-foreground">No tienes los permisos necesarios para acceder a esta página.</p>
      </div>
    );
  }

  return <>{children}</>;
}
