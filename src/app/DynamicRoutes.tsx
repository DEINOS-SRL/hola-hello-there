import { Routes, Route, Navigate } from 'react-router-dom';
import { useModulosDB } from '@/modules/security/hooks/useModulos';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

// Páginas estáticas
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Modulos from '@/pages/Modulos';
import Perfil from '@/pages/Perfil';
import Configuracion from '@/pages/Configuracion';
import ConfiguracionEmpresa from '@/pages/ConfiguracionEmpresa';
import ConfiguracionNotificaciones from '@/pages/ConfiguracionNotificaciones';
import ConfiguracionPreferencias from '@/pages/ConfiguracionPreferencias';
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
import ConocimientoIndex from '@/modules/conocimiento/pages/Index';
import ConocimientoSGI from '@/modules/conocimiento/pages/SGI';
import OperacionIndex from '@/modules/operacion/pages/Index';
import OperacionMovimientos from '@/modules/operacion/pages/Movimientos';
import OperacionPartesEquipos from '@/modules/operacion/pages/PartesEquipos';
// Equipos
import EquiposIndex from '@/modules/equipos/pages/Index';
import EquiposListado from '@/modules/equipos/pages/Listado';
import EquiposMantenimientos from '@/modules/equipos/pages/Mantenimientos';
// Habilitaciones
import HabilitacionesIndex from '@/modules/habilitaciones/pages/Index';
import HabilitacionesCertificaciones from '@/modules/habilitaciones/pages/Certificaciones';
import HabilitacionesVencimientos from '@/modules/habilitaciones/pages/Vencimientos';
// Partes Diarios
import PartesIndex from '@/modules/partes/pages/Index';
import PartesRegistro from '@/modules/partes/pages/Registro';
import PartesHistorial from '@/modules/partes/pages/Historial';

// Mapeo de rutas a componentes implementados
const implementedRoutes: Record<string, React.ComponentType> = {
  // Configuración y sus subpáginas
  '/configuracion': Configuracion,
  '/configuracion/empresa': ConfiguracionEmpresa,
  '/configuracion/notificaciones': ConfiguracionNotificaciones,
  '/configuracion/preferencias': ConfiguracionPreferencias,
  // Administración (antes Seguridad)
  '/configuracion/administracion': SeguridadIndex,
  '/configuracion/administracion/usuarios': Usuarios,
  '/configuracion/administracion/empresas': Empresas,
  '/configuracion/administracion/roles': Roles,
  '/configuracion/administracion/modulos': ModulosAdmin,
  // Legacy routes - mantener compatibilidad
  '/seguridad': SeguridadIndex,
  '/seguridad/usuarios': Usuarios,
  '/seguridad/empresas': Empresas,
  '/seguridad/roles': Roles,
  '/seguridad/modulos': ModulosAdmin,
  // RRHH
  '/rrhh': RRHHIndex,
  '/rrhh/empleados': RRHHEmpleados,
  '/rrhh/asistencia': RRHHAsistencia,
  // Conocimiento
  '/conocimiento': ConocimientoIndex,
  '/conocimiento/sgi': ConocimientoSGI,
  // Operación
  '/operacion': OperacionIndex,
  '/operacion/movimientos': OperacionMovimientos,
  '/operacion/partes-equipos': OperacionPartesEquipos,
  // Equipos
  '/equipos': EquiposIndex,
  '/equipos/listado': EquiposListado,
  '/equipos/mantenimientos': EquiposMantenimientos,
  // Habilitaciones
  '/habilitaciones': HabilitacionesIndex,
  '/habilitaciones/certificaciones': HabilitacionesCertificaciones,
  '/habilitaciones/vencimientos': HabilitacionesVencimientos,
  // Partes Diarios
  '/partes-diarios': PartesIndex,
  '/partes-diarios/registro': PartesRegistro,
  '/partes-diarios/historial': PartesHistorial,
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

// Rutas estáticas del sistema (configuracion ahora es dinámica)
const staticPaths = ['/dashboard', '/modulos', '/perfil', '/login', '/reset-password', '/'];

export function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const { modulos } = useModulosDB();
  
  // Generar rutas dinámicas desde los módulos de la BD
  const dynamicRoutes = useMemo(() => {
    if (!modulos.length) return [];
    
    return modulos
      .filter(m => m.ruta && !staticPaths.includes(m.ruta))
      .map(m => ({
        path: m.ruta,
        component: implementedRoutes[m.ruta] || ModuloPlaceholder,
      }));
  }, [modulos]);
  
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
      
      {/* Rutas dinámicas de módulos desde BD */}
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
      
      {/* Redirect legacy */}
      <Route path="/empleados" element={<Navigate to="/rrhh/empleados" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
