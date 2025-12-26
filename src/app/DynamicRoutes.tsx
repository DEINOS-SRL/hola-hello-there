import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useModulosDB } from '@/modules/security/hooks/useModulos';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { useMemo, lazy, Suspense } from 'react';

// Páginas estáticas (core - siempre cargadas)
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import Landing from '@/pages/Landing';
import ModuloPlaceholder from '@/pages/ModuloPlaceholder';

// Lazy loading para páginas menos frecuentes
const Modulos = lazy(() => import('@/pages/Modulos'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const Documentacion = lazy(() => import('@/pages/Documentacion'));
const Configuracion = lazy(() => import('@/pages/Configuracion'));
const ConfiguracionEmpresa = lazy(() => import('@/pages/ConfiguracionEmpresa'));
const ConfiguracionNotificaciones = lazy(() => import('@/pages/ConfiguracionNotificaciones'));
const ConfiguracionPreferencias = lazy(() => import('@/pages/ConfiguracionPreferencias'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Lazy loading para módulos (code-splitting por módulo)
const SeguridadIndex = lazy(() => import('@/modules/security/pages/Index'));
const Usuarios = lazy(() => import('@/modules/security/pages/Usuarios'));
const Empresas = lazy(() => import('@/modules/security/pages/Empresas'));
const Roles = lazy(() => import('@/modules/security/pages/Roles'));
const ModulosAdmin = lazy(() => import('@/modules/security/pages/Modulos'));
const Feedbacks = lazy(() => import('@/modules/security/pages/Feedbacks'));

const RRHHIndex = lazy(() => import('@/modules/rrhh/pages/Index'));
const RRHHEmpleados = lazy(() => import('@/modules/rrhh/pages/Empleados'));
const RRHHAsistencia = lazy(() => import('@/modules/rrhh/pages/Asistencia'));
const RRHHPartesDiarios = lazy(() => import('@/modules/rrhh/pages/PartesDiarios'));

const ConocimientoIndex = lazy(() => import('@/modules/conocimiento/pages/Index'));
const ConocimientoSGI = lazy(() => import('@/modules/conocimiento/pages/SGI'));

const OperacionIndex = lazy(() => import('@/modules/operacion/pages/Index'));
const OperacionMovimientos = lazy(() => import('@/modules/operacion/pages/Movimientos'));
const OperacionPartesEquipos = lazy(() => import('@/modules/operacion/pages/PartesEquipos'));
const OperacionClientes = lazy(() => import('@/modules/operacion/pages/Clientes'));
const OperacionConfiguracionLineas = lazy(() => import('@/modules/operacion/pages/ConfiguracionLineas'));

const EquiposIndex = lazy(() => import('@/modules/equipos/pages/Index'));
const EquiposListado = lazy(() => import('@/modules/equipos/pages/Listado'));
const EquiposMantenimientos = lazy(() => import('@/modules/equipos/pages/Mantenimientos'));
const EquiposPartes = lazy(() => import('@/modules/equipos/pages/Partes'));

const HabilitacionesIndex = lazy(() => import('@/modules/habilitaciones/pages/Index'));
const HabilitacionesCertificaciones = lazy(() => import('@/modules/habilitaciones/pages/Certificaciones'));
const HabilitacionesVencimientos = lazy(() => import('@/modules/habilitaciones/pages/Vencimientos'));

const ComercialIndex = lazy(() => import('@/modules/comercial/pages/Index'));
const ComercialPresupuestos = lazy(() => import('@/modules/comercial/pages/Presupuestos'));
const ComercialCertificaciones = lazy(() => import('@/modules/comercial/pages/Certificaciones'));
const ComercialSeguimientos = lazy(() => import('@/modules/comercial/pages/Seguimientos'));

// Componente de loading para Suspense
function LazyLoadFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

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
  '/rrhh/partes-diarios': RRHHPartesDiarios,
  // Conocimiento
  '/conocimiento': ConocimientoIndex,
  '/conocimiento/sgi': ConocimientoSGI,
  // Operación
  '/operacion': OperacionIndex,
  '/operacion/movimientos': OperacionMovimientos,
  '/operacion/partes-equipos': OperacionPartesEquipos,
  '/operacion/clientes': OperacionClientes,
  '/operacion/configuracion-lineas': OperacionConfiguracionLineas,
  // Equipos
  '/equipos': EquiposIndex,
  '/equipos/listado': EquiposListado,
  '/equipos/mantenimientos': EquiposMantenimientos,
  '/equipos/partes': EquiposPartes,
  // Habilitaciones
  '/habilitaciones': HabilitacionesIndex,
  '/habilitaciones/certificaciones': HabilitacionesCertificaciones,
  '/habilitaciones/vencimientos': HabilitacionesVencimientos,
  // Comercial
  '/comercial': ComercialIndex,
  '/comercial/presupuestos': ComercialPresupuestos,
  '/comercial/certificaciones': ComercialCertificaciones,
  '/comercial/seguimientos': ComercialSeguimientos,
};

function ProtectedLayout() {
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

  return (
    <AppLayout>
      <Suspense fallback={<LazyLoadFallback />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
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
      <Route path="/reset-password" element={<Suspense fallback={<LazyLoadFallback />}><ResetPassword /></Suspense>} />

      {/* Rutas protegidas (layout persistente) */}
      <Route element={<ProtectedLayout />}>
        {/* Rutas protegidas estáticas */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="modulos" element={<Modulos />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="documentacion" element={<Suspense fallback={<LazyLoadFallback />}><Documentacion /></Suspense>} />
        
        {/* Rutas de configuración (estáticas) */}
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="configuracion/empresa" element={<ConfiguracionEmpresa />} />
        <Route path="configuracion/notificaciones" element={<ConfiguracionNotificaciones />} />
        <Route path="configuracion/preferencias" element={<ConfiguracionPreferencias />} />
        <Route path="configuracion/administracion" element={<SeguridadIndex />} />
        <Route path="configuracion/administracion/usuarios" element={<Usuarios />} />
        <Route path="configuracion/administracion/empresas" element={<Empresas />} />
        <Route path="configuracion/administracion/roles" element={<Roles />} />
        <Route path="configuracion/administracion/modulos" element={<ModulosAdmin />} />
        <Route path="configuracion/administracion/feedbacks" element={<Feedbacks />} />

        {/* Rutas dinámicas de módulos desde BD */}
        {dynamicRoutes.map(({ path, component: Component }) => (
          <Route
            key={path}
            path={path.startsWith('/') ? path.slice(1) : path}
            element={<Component />}
          />
        ))}

        {/* Redirect legacy */}
        <Route path="empleados" element={<Navigate to="/rrhh/empleados" replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
