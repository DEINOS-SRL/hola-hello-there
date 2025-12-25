import { Routes, Route, Navigate } from 'react-router-dom';
import { useModulosDB, ModuloDB } from '@/modules/security/hooks/useModulos';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { lazy, Suspense, useMemo } from 'react';

// Páginas estáticas
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Modulos from '@/pages/Modulos';
import Perfil from '@/pages/Perfil';
import Configuracion from '@/pages/Configuracion';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';
import Landing from '@/pages/Landing';
import ModuloPlaceholder from '@/pages/ModuloPlaceholder';

// Páginas implementadas de módulos (mapeo ruta -> componente)
import SeguridadIndex from '@/modules/security/pages/Index';
import Usuarios from '@/modules/security/pages/Usuarios';
import Empresas from '@/modules/security/pages/Empresas';
import Roles from '@/modules/security/pages/Roles';
import ModulosAdmin from '@/modules/security/pages/Modulos';
import RRHHIndex from '@/modules/rrhh/pages/Index';
import RRHHEmpleados from '@/modules/rrhh/pages/Empleados';
import RRHHAsistencia from '@/modules/rrhh/pages/Asistencia';

// Mapeo de rutas a componentes implementados
const implementedRoutes: Record<string, React.ComponentType> = {
  '/seguridad': SeguridadIndex,
  '/seguridad/usuarios': Usuarios,
  '/seguridad/empresas': Empresas,
  '/seguridad/roles': Roles,
  '/seguridad/modulos': ModulosAdmin,
  '/rrhh': RRHHIndex,
  '/rrhh/empleados': RRHHEmpleados,
  '/rrhh/asistencia': RRHHAsistencia,
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
}

// Genera las rutas dinámicas desde los módulos de la BD
function DynamicModuleRoutes() {
  const { modulos, isLoading } = useModulosDB();

  // Generar rutas únicas de todos los módulos
  const dynamicRoutes = useMemo(() => {
    if (!modulos.length) return [];
    
    // Filtrar rutas que no sean las estáticas del sistema
    const staticPaths = ['/dashboard', '/modulos', '/perfil', '/configuracion', '/login', '/reset-password', '/'];
    
    return modulos
      .filter(m => m.ruta && !staticPaths.includes(m.ruta))
      .map(m => ({
        path: m.ruta,
        component: implementedRoutes[m.ruta] || ModuloPlaceholder,
      }));
  }, [modulos]);

  return (
    <>
      {dynamicRoutes.map(({ path, component: Component }) => (
        <Route 
          key={path} 
          path={path} 
          element={
            <ProtectedRoute>
              <Component />
            </ProtectedRoute>
          } 
        />
      ))}
    </>
  );
}

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Rutas protegidas estáticas */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/modulos" element={<ProtectedRoute><Modulos /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
      
      {/* Rutas dinámicas de módulos desde BD */}
      <DynamicModuleRoutes />
      
      {/* Redirect legacy */}
      <Route path="/empleados" element={<Navigate to="/rrhh/empleados" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
